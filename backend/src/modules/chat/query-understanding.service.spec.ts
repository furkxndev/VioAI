import { describe, expect, it } from 'bun:test';
import type { OpenRouterService } from '../ai/openrouter.service';
import { QueryUnderstandingService } from './query-understanding.service';

/** Verilen JSON'u döndüren sahte OpenRouter servisi. */
const sahteRouter = (icerik: string): OpenRouterService =>
  ({
    chat: () => Promise.resolve({ content: icerik, model: 'test' }),
  }) as unknown as OpenRouterService;

const cozumle = (icerik: string, cityHint?: string) =>
  new QueryUnderstandingService(sahteRouter(icerik)).understand('soru', cityHint);

describe('QueryUnderstandingService', () => {
  it('tam bir yanıtı filtreye çevirir', async () => {
    const { filters, isActivitySearch } = await cozumle(
      JSON.stringify({
        isActivitySearch: true,
        restated: 'yağmurlu günde çocukla gezi',
        city: 'Antalya',
        requiresIndoor: true,
        childAge: 3,
        travelers: 2,
        budget: 4000,
        currency: 'try',
        interests: ['el işi', 'müze'],
        date: '2026-08-29',
        statedWeather: 'yağmurlu',
      }),
    );

    expect(isActivitySearch).toBe(true);
    expect(filters.city).toBe('Antalya');
    expect(filters.requiresIndoor).toBe(true);
    expect(filters.childAge).toBe(3);
    expect(filters.currency).toBe('TRY');
    expect(filters.interests).toEqual(['el işi', 'müze']);
  });

  it('çocuk yoksa childAge null kalır — 0 OLMAZ', async () => {
    // Number(null) === 0 tuzağı: childAge 0 olursa SQL "minAge <= 0" filtreler ve
    // yaş sınırı olan bütün ürünler gereksiz yere elenir.
    const { filters } = await cozumle(
      JSON.stringify({ isActivitySearch: true, city: 'İzmir', childAge: null, travelers: null }),
    );

    expect(filters.childAge).toBeNull();
    expect(filters.travelers).toBeNull();
  });

  it('bütçe verilmemişse null döner', async () => {
    const { filters } = await cozumle(
      JSON.stringify({ isActivitySearch: true, city: 'Bursa', budget: null }),
    );
    expect(filters.budget).toBeNull();
  });

  it('şehir yoksa ipucundaki şehre düşer', async () => {
    const { filters } = await cozumle(
      JSON.stringify({ isActivitySearch: true, city: null }),
      'Muğla',
    );
    expect(filters.city).toBe('Muğla');
  });

  it('geçersiz tarih biçimi yok sayılır', async () => {
    const { filters } = await cozumle(
      JSON.stringify({ isActivitySearch: true, city: 'Ankara', date: 'yarın' }),
    );
    expect(filters.date).toBeNull();
  });

  it('yaş makul aralığa sıkıştırılır', async () => {
    const { filters } = await cozumle(
      JSON.stringify({ isActivitySearch: true, city: 'Ankara', childAge: 250 }),
    );
    expect(filters.childAge).toBe(17);
  });

  it('bozuk JSON gelirse istek düşmez, şehir sorulur', async () => {
    const { filters, isActivitySearch } = await cozumle('bu JSON değil', 'Adana');

    expect(isActivitySearch).toBe(false);
    expect(filters.city).toBe('Adana');
    expect(filters.interests).toEqual([]);
  });
});
