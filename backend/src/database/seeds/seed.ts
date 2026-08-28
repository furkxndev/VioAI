import { DataSource } from 'typeorm';
import { Category } from '../../modules/categories/entities/category.entity';
import { Product } from '../../modules/products/entities/product.entity';
import dataSource from '../data-source';
import { viofunCatalog, type ProductSeed } from './catalog.seed';

const DEFAULT_CURRENCY = 'TRY';

const seedCategories = async (ds: DataSource): Promise<Map<string, string>> => {
  const repository = ds.getRepository(Category);
  const slugToId = new Map<string, string>();

  for (const seed of viofunCatalog.categories) {
    const existing = await repository.findOneBy({ slug: seed.slug });
    const category = existing
      ? await repository.save(Object.assign(existing, seed, { isActive: true }))
      : await repository.save(repository.create({ ...seed, isActive: true }));

    slugToId.set(seed.slug, category.id);
  }

  console.log(`- ${viofunCatalog.categories.length} kategori hazır`);

  return slugToId;
};

const toProduct = (seed: ProductSeed, categoryId: string): Partial<Product> => ({
  name: seed.name,
  description: seed.description || seed.name,
  categoryId,
  price: seed.price ?? 0,
  currency: seed.currency ?? DEFAULT_CURRENCY,
  city: seed.city,
  district: seed.district,
  address: seed.address,
  latitude: seed.latitude,
  longitude: seed.longitude,
  durationMinutes: seed.durationMinutes,
  tags: seed.tags,
  imageUrl: seed.imageUrl,
  bookingUrl: seed.bookingUrl,
  isActive: true,
  isAiRecommendable: seed.isAiRecommendable,
  popularityScore: seed.isFeatured ? 90 : 50,
});

const seedProducts = async (ds: DataSource, slugToId: Map<string, string>): Promise<void> => {
  const repository = ds.getRepository(Product);
  let created = 0;
  let updated = 0;

  for (const seed of viofunCatalog.products) {
    const categoryId = slugToId.get(seed.categorySlug);

    if (!categoryId) {
      console.warn(`  ! Kategori bulunamadı: ${seed.categorySlug} (${seed.name})`);
      continue;
    }

    const payload = toProduct(seed, categoryId);
    const existing = await repository.findOneBy({ name: seed.name });

    if (existing) {
      await repository.save(Object.assign(existing, payload));
      updated += 1;
    } else {
      await repository.save(repository.create(payload));
      created += 1;
    }
  }

  console.log(`- ${created} ürün eklendi, ${updated} ürün güncellendi`);
};

const run = async (): Promise<void> => {
  const ds = await dataSource.initialize();

  try {
    console.log(`VioAI katalog seed (kaynak: ${viofunCatalog.source}, ${viofunCatalog.fetchedAt})`);
    const slugToId = await seedCategories(ds);
    await seedProducts(ds, slugToId);
    console.log('Seed tamamlandı. İlk kayıt olan kullanıcı otomatik olarak yönetici yetkisi alır.');
  } finally {
    await ds.destroy();
  }
};

run().catch((error: unknown) => {
  console.error('Seed başarısız:', error);
  process.exit(1);
});
