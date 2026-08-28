import { describe, expect, it } from 'bun:test';
import type { Product } from '../products/entities/product.entity';
import { cosineSimilarity } from './embedding.service';
import type { GeneratedItinerary } from './interfaces/itinerary.interface';
import {
  type MatchContext,
  ProductMatcherService,
} from './product-matcher.service';

const matcher = new ProductMatcherService();

/** Verilen boyutta birim uzunlukta bir vektör üretir. */
const birimVektor = (degerler: number[]): number[] => {
  const uzunluk = Math.sqrt(degerler.reduce((t, d) => t + d * d, 0));
  return degerler.map((d) => d / uzunluk);
};

const urun = (ozel: Partial<Product> = {}): Product =>
  ({
    id: 'p1',
    categoryId: 'c1',
    name: 'Mozaik Cam Lamba Atölyesi',
    category: { name: 'Deneyim' },
    tags: ['Kurs', 'Sanat'],
    latitude: 38.4189,
    longitude: 27.1287,
    price: 500,
    currency: 'TRY',
    rating: 4.5,
    popularityScore: 60,
    embedding: null,
    ...ozel,
  }) as unknown as Product;

const rota: GeneratedItinerary = {
  title: 'İzmir',
  summary: '',
  estimatedTotalCost: 0,
  days: [
    {
      day: 1,
      theme: 'gezi',
      stops: [
        {
          title: 'Konak Meydanı',
          description: '',
          category: 'meydan',
          startTime: '10:00',
          durationMinutes: 60,
          estimatedCost: 0,
          latitude: 38.4189,
          longitude: 27.1287,
        },
      ],
    },
  ],
};

const baglam = (ozel: Partial<MatchContext> = {}): MatchContext => ({
  interests: ['el işi'],
  budget: 10_000,
  currency: 'TRY',
  travelers: 2,
  spentEstimate: 0,
  ...ozel,
});

const skorla = (p: Product, ctx: MatchContext): number => {
  const [eslesme] = matcher.match(rota, [p], ctx, {
    minScore: 0,
    maxMatches: 1,
  });
  return eslesme?.score ?? 0;
};

describe('cosineSimilarity', () => {
  it('aynı vektör için 1 döner', () => {
    const v = birimVektor([1, 2, 3]);
    expect(cosineSimilarity(v, v)).toBeCloseTo(1, 6);
  });

  it('dik vektörler için 0 döner', () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0, 6);
  });

  it('boyutlar uyuşmuyorsa 0 döner, hata fırlatmaz', () => {
    expect(cosineSimilarity([1, 0, 0], [1, 0])).toBe(0);
  });
});

describe('ProductMatcherService — anlamsal eşleştirme', () => {
  it('kelime örtüşmesi sıfırken anlamsal benzerlik ilgi puanı kazandırır', () => {
    // "el işi" ürünün adında, kategorisinde ve etiketlerinde geçmiyor.
    const vektor = birimVektor([1, 0, 0, 0]);

    const kelimeIle = skorla(urun(), baglam());
    const anlamIle = skorla(
      urun({ embedding: vektor }),
      baglam({ interestEmbedding: vektor }),
    );

    expect(anlamIle).toBeGreaterThan(kelimeIle);
  });

  it('gömme vektörü eklemek mevcut skoru asla düşürmez', () => {
    // Kelime örtüşmesi zaten tam olan bir ürün: anlamsal sinyal zayıf olsa bile
    // max() aldığımız için skor sabit kalmalı.
    const alakasiz = birimVektor([0, 1, 0, 0]);
    const p = urun({ tags: ['el', 'işi'] });

    const oncesi = skorla(p, baglam());
    const sonrasi = skorla(
      urun({ tags: ['el', 'işi'], embedding: alakasiz }),
      baglam({ interestEmbedding: birimVektor([1, 0, 0, 0]) }),
    );

    expect(sonrasi).toBeGreaterThanOrEqual(oncesi);
  });

  it('ilgi vektörü yoksa skor gömme öncesiyle birebir aynı kalır', () => {
    const vektorlu = urun({ embedding: birimVektor([1, 0, 0, 0]) });

    // interestEmbedding verilmediğinde ürünün vektörü olsa bile kullanılmaz.
    expect(skorla(vektorlu, baglam())).toBe(skorla(urun(), baglam()));
  });

  it('ürünün gömmesi yoksa anlamsal sinyal devreye girmez', () => {
    expect(
      skorla(
        urun({ embedding: null }),
        baglam({ interestEmbedding: birimVektor([1, 0]) }),
      ),
    ).toBe(skorla(urun(), baglam()));
  });

  it('anlamsal eşleşmede gerekçe metni bunu belirtir', () => {
    const vektor = birimVektor([1, 0, 0, 0]);
    const [eslesme] = matcher.match(
      rota,
      [urun({ embedding: vektor })],
      baglam({ interestEmbedding: vektor }),
      { minScore: 0, maxMatches: 1 },
    );

    expect(eslesme.reason).toContain('anlamca yakın');
  });
});
