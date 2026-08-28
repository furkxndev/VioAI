import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EmbeddingConfig } from '../../config/configuration';

type FeatureExtractor = (
  texts: string[],
  options: { pooling: 'mean'; normalize: boolean },
) => Promise<{ data: Float32Array; dims: number[] }>;

/**
 * Ürün ve ilgi alanı metinlerini vektöre çeviren yerel gömme servisi.
 *
 * Model (paraphrase-multilingual-MiniLM-L12-v2) süreç içinde çalışır; dış servise
 * istek gitmez ve API anahtarı gerekmez. Model yüklenemezse servis sessizce devre
 * dışı kalır ve `isAvailable` false döner — çağıran taraf kelime örtüşmesine geri düşer.
 */
@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private extractor: FeatureExtractor | null = null;
  private loading: Promise<FeatureExtractor | null> | null = null;
  private failed = false;

  constructor(private readonly configService: ConfigService) {}

  get config(): EmbeddingConfig {
    return this.configService.getOrThrow<EmbeddingConfig>('embedding');
  }

  /** Model şu anda belleğe yüklü mü (tembel yükleme yapıldı mı). */
  get isLoaded(): boolean {
    return this.extractor !== null;
  }

  /**
   * Anlamsal eşleştirme kullanılabilir mi. Model tembel yüklendiği için ilk
   * istekten önce de true döner; yalnızca yapılandırma kapalıysa veya yükleme
   * kalıcı olarak başarısız olduysa false olur.
   */
  get isAvailable(): boolean {
    return this.config.enabled && !this.failed;
  }

  get model(): string {
    return this.config.model;
  }

  get dimensions(): number {
    return this.config.dimensions;
  }

  /**
   * Ürünün gömülecek metnini kurar. Seed ve sorgu tarafı aynı biçimi kullanmalı,
   * yoksa vektörler karşılaştırılabilir olmaz.
   */
  buildProductText(product: {
    name: string;
    category?: { name: string } | null;
    tags?: string[] | null;
    description?: string | null;
  }): string {
    const parcalar = [
      product.name,
      product.category?.name ?? '',
      (product.tags ?? []).join(', '),
      (product.description ?? '')
        .replace(/\s+/g, ' ')
        .slice(0, this.config.maxDescriptionChars),
    ];
    return parcalar.filter(Boolean).join('. ');
  }

  /**
   * Metinleri vektöre çevirir. Model yoksa veya yüklenemezse null döner;
   * bu bir hata değildir, çağıran taraf kelime örtüşmesiyle devam eder.
   */
  async embed(texts: string[]): Promise<number[][] | null> {
    if (texts.length === 0) return [];

    const extractor = await this.load();
    if (!extractor) return null;

    try {
      const output = await extractor(texts, {
        pooling: 'mean',
        normalize: true,
      });
      const dim = output.dims[output.dims.length - 1];
      return texts.map((_, i) =>
        Array.from(output.data.slice(i * dim, (i + 1) * dim)),
      );
    } catch (error) {
      this.logger.error(
        'Gömme üretilemedi, kelime örtüşmesine geri dönülüyor',
        error instanceof Error ? error.stack : String(error),
      );
      return null;
    }
  }

  /** Tek metin için kısayol. */
  async embedOne(text: string): Promise<number[] | null> {
    const sonuc = await this.embed([text]);
    return sonuc?.[0] ?? null;
  }

  /** Modeli tembel yükler; aynı anda gelen çağrılar tek yüklemeyi paylaşır. */
  private load(): Promise<FeatureExtractor | null> {
    if (this.extractor) return Promise.resolve(this.extractor);
    if (this.failed || !this.config.enabled) return Promise.resolve(null);
    if (this.loading) return this.loading;

    this.loading = (async () => {
      try {
        const baslangic = Date.now();
        // Dinamik import: gömme kapalıysa ~120 MB'lık paket hiç yüklenmez.
        const { pipeline, env } = await import('@huggingface/transformers');
        if (this.config.cacheDir) {
          env.cacheDir = this.config.cacheDir;
        }
        const pipe = await pipeline('feature-extraction', this.config.model);
        this.extractor = pipe as unknown as FeatureExtractor;
        this.logger.log(
          `Gömme modeli yüklendi: ${this.config.model} (${Date.now() - baslangic} ms)`,
        );
        return this.extractor;
      } catch (error) {
        this.failed = true;
        this.logger.warn(
          `Gömme modeli yüklenemedi, anlamsal eşleştirme devre dışı: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
        return null;
      } finally {
        this.loading = null;
      }
    })();

    return this.loading;
  }
}

/**
 * İki normalize edilmiş vektörün kosinüs benzerliği.
 * Vektörler zaten birim uzunlukta olduğu için nokta çarpımı yeterlidir.
 */
export const cosineSimilarity = (a: number[], b: number[]): number => {
  if (a.length === 0 || a.length !== b.length) return 0;
  let toplam = 0;
  for (let i = 0; i < a.length; i += 1) {
    toplam += a[i] * b[i];
  }
  return Number.isFinite(toplam) ? toplam : 0;
};
