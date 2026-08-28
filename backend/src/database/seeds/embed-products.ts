/**
 * Ürünlerin gömme (embedding) vektörlerini üretir ve veritabanına yazar.
 *
 *   bun run embed          → yalnızca vektörü olmayan ürünleri işler
 *   bun run embed --force  → hepsini yeniden üretir (model değiştiyse gerekir)
 *
 * Model yerel çalışır; API anahtarı gerekmez. İlk çalıştırmada model indirilir.
 */
import { pipeline, env } from '@huggingface/transformers';
import { IsNull, Not } from 'typeorm';
import { Product } from '../../modules/products/entities/product.entity';
import dataSource from '../data-source';

const MODEL =
  process.env.EMBEDDING_MODEL ?? 'Xenova/paraphrase-multilingual-MiniLM-L12-v2';
const MAX_DESCRIPTION_CHARS = Number(
  process.env.EMBEDDING_MAX_DESCRIPTION_CHARS ?? 450,
);
const BATCH = 32;

/** EmbeddingService.buildProductText ile aynı biçim — ikisi ayrışırsa vektörler karşılaştırılamaz. */
const buildText = (p: Product): string =>
  [
    p.name,
    p.category?.name ?? '',
    (p.tags ?? []).join(', '),
    (p.description ?? '').replace(/\s+/g, ' ').slice(0, MAX_DESCRIPTION_CHARS),
  ]
    .filter(Boolean)
    .join('. ');

const run = async (): Promise<void> => {
  const force = process.argv.includes('--force');
  const ds = await dataSource.initialize();
  const repository = ds.getRepository(Product);

  try {
    const products = await repository.find({
      where: force ? {} : { embedding: IsNull() },
      relations: { category: true },
      select: {
        id: true,
        name: true,
        description: true,
        tags: true,
        category: { id: true, name: true },
      },
      order: { createdAt: 'ASC' },
    });

    if (products.length === 0) {
      const mevcut = await repository.countBy({ embedding: Not(IsNull()) });
      console.log(`Gömülecek ürün yok. Vektörü olan ürün sayısı: ${mevcut}`);
      return;
    }

    console.log(`${products.length} ürün gömülecek. Model: ${MODEL}`);
    if (process.env.EMBEDDING_CACHE_DIR) {
      env.cacheDir = process.env.EMBEDDING_CACHE_DIR;
    }

    const baslangic = Date.now();
    const extractor = await pipeline('feature-extraction', MODEL);
    console.log(
      `- model hazır (${((Date.now() - baslangic) / 1000).toFixed(1)} sn)`,
    );

    let islenen = 0;
    for (let i = 0; i < products.length; i += BATCH) {
      const dilim = products.slice(i, i + BATCH);
      const output = await extractor(dilim.map(buildText), {
        pooling: 'mean',
        normalize: true,
      });
      const dim = output.dims[output.dims.length - 1];
      const veri = output.data as Float32Array;

      await Promise.all(
        dilim.map((product, k) =>
          repository.update(product.id, {
            embedding: Array.from(veri.slice(k * dim, (k + 1) * dim)),
            embeddingModel: MODEL,
          }),
        ),
      );

      islenen += dilim.length;
      process.stdout.write(`\r- ${islenen}/${products.length} ürün gömüldü`);
    }

    console.log(
      `\n- tamamlandı (${((Date.now() - baslangic) / 1000).toFixed(1)} sn)`,
    );
  } finally {
    await ds.destroy();
  }
};

run().catch((error) => {
  console.error('Gömme başarısız:', error);
  process.exit(1);
});
