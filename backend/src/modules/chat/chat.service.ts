import { Injectable, Logger } from '@nestjs/common';
import { cosineSimilarity, EmbeddingService } from '../ai/embedding.service';
import { OpenRouterService } from '../ai/openrouter.service';
import type { Product } from '../products/entities/product.entity';
import { ProductsService } from '../products/products.service';
import { WeatherService, type WeatherForecast } from '../weather/weather.service';
import type { ChatFilters } from './chat-query.interface';
import { ChatAnswerDto, ChatQueryDto, ChatSuggestionDto } from './dto';
import { QueryUnderstandingService } from './query-understanding.service';

/** Kullanıcıya en fazla kaç ürün gösterilir. */
const MAX_SUGGESTIONS = 5;
/** Cevap üretimi için modele verilen aday sayısı. */
const CANDIDATE_LIMIT = 24;

const ANSWER_SYSTEM_PROMPT = `Sen VioAI'sın; Viofun için çalışan yardımcı bir gezi danışmanısın.
Kullanıcının sorusuna, SANA VERİLEN aktivite listesine dayanarak Türkçe cevap yazacaksın.

Kurallar:
- SADECE sana verilen listedeki aktiviteleri öner. Listede olmayan bir yer, bilet veya
  tur uydurma. Genel bilgi verme, "şuraya da gidebilirsiniz" diye liste dışına çıkma.
- Liste boşsa dürüst ol: aradığı kriterlere uyan aktivite bulamadığını söyle ve neden
  (şehirde az aktivite olması, yaş sınırı, kapalı mekân kısıtı) kısaca açıkla.
- Her öneri için NEDEN uygun olduğunu bir cümleyle belirt; kullanıcının kısıtlarına
  (hava, çocuğun yaşı, ilgi alanı) açıkça değin.
- Yaş sınırı olan aktiviteleri önerirken sınırı belirt.
- Sıcak, sade ve kısa yaz. En fazla 4-5 cümlelik bir giriş, sonra aktiviteleri anlat.
- Fiyat verilmişse para birimiyle birlikte yaz, dönüştürme yapma.
- Markdown başlık kullanma, düz paragraf ve kısa liste yeterli.`;

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly understanding: QueryUnderstandingService,
    private readonly openRouterService: OpenRouterService,
    private readonly embeddingService: EmbeddingService,
    private readonly productsService: ProductsService,
    private readonly weatherService: WeatherService,
  ) {}

  async ask(dto: ChatQueryDto): Promise<ChatAnswerDto> {
    const baslangic = Date.now();

    // ① Soruyu yapılandırılmış kısıtlara çevir
    const { filters, isActivitySearch, restated } = await this.understanding.understand(
      dto.message,
      dto.city,
    );

    if (!isActivitySearch) {
      return this.plainAnswer(
        'Ben gezilecek yer ve aktivite önerileri konusunda yardımcı olabiliyorum. ' +
          'Hangi şehirde, ne tür bir şey aradığınızı yazarsanız size uygun aktiviteleri listeleyebilirim.',
        filters,
        null,
        baslangic,
      );
    }

    if (!filters.city) {
      return this.plainAnswer(
        'Hangi şehir için baktığınızı yazar mısınız? Şehri bilirsem size uygun aktiviteleri listeleyebilirim.',
        filters,
        null,
        baslangic,
        true,
      );
    }

    // ② Hava durumu: kullanıcı söylemediyse ve tarih verdiyse Open-Meteo'ya sor
    const weather = await this.resolveWeather(filters);
    if (weather?.isWet) {
      filters.requiresIndoor = true;
    }

    // ③ Sert kısıtlarla adayları getir, sonra anlamsal olarak sırala
    const candidates = await this.productsService.findChatCandidates({
      city: filters.city,
      requiresIndoor: filters.requiresIndoor,
      childAge: filters.childAge,
      maxPrice: this.perPersonBudget(filters),
      limit: CANDIDATE_LIMIT,
    });

    const sirali = await this.rankByInterest(candidates, filters.interests);
    const secilen = sirali.slice(0, MAX_SUGGESTIONS);

    // ④ Cevabı yazdır
    const answer = await this.writeAnswer(dto.message, restated, filters, weather, secilen);

    return {
      answer,
      filters,
      weather,
      suggestions: secilen.map((p) => this.toSuggestion(p)),
      needsCity: false,
      generationMs: Date.now() - baslangic,
    };
  }

  /** Kullanıcı havayı kendisi söylemediyse ve tarih varsa tahmine bakar. */
  private async resolveWeather(filters: ChatFilters): Promise<WeatherForecast | null> {
    if (!filters.city || !filters.date || filters.statedWeather) {
      return null;
    }

    return this.weatherService.getForecast(filters.city, filters.date);
  }

  /** Bütçe toplam verildiyse kişi başına çevirir; ürün fiyatları kişi başıdır. */
  private perPersonBudget(filters: ChatFilters): number | undefined {
    if (filters.budget === null) return undefined;
    const kisi = filters.travelers ?? 1;
    return Math.max(filters.budget / Math.max(kisi, 1), 1);
  }

  /**
   * Adayları ilgi alanlarına anlamsal yakınlığa göre sıralar.
   * Gömme yoksa veya ilgi belirtilmemişse SQL sırası (popülerlik) korunur.
   */
  private async rankByInterest(candidates: Product[], interests: string[]): Promise<Product[]> {
    if (candidates.length === 0 || interests.length === 0) {
      return candidates;
    }

    const sorguVektoru = await this.embeddingService.embedOne(interests.join(', '));
    if (!sorguVektoru) {
      return candidates;
    }

    return [...candidates].sort((a, b) => {
      const sa = a.embedding?.length ? cosineSimilarity(sorguVektoru, a.embedding) : -1;
      const sb = b.embedding?.length ? cosineSimilarity(sorguVektoru, b.embedding) : -1;
      return sb - sa;
    });
  }

  private async writeAnswer(
    message: string,
    restated: string,
    filters: ChatFilters,
    weather: WeatherForecast | null,
    products: Product[],
  ): Promise<string> {
    const baglam = [`Kullanıcının sorusu: ${message}`];

    if (restated) baglam.push(`Anlaşılan istek: ${restated}`);
    baglam.push(`Şehir: ${filters.city}`);
    if (filters.childAge !== null) baglam.push(`Gruptaki en küçük çocuk: ${filters.childAge} yaşında`);
    if (filters.travelers !== null) baglam.push(`Kişi sayısı: ${filters.travelers}`);
    if (filters.budget !== null) baglam.push(`Bütçe: ${filters.budget} ${filters.currency ?? 'TRY'}`);
    if (filters.interests.length) baglam.push(`İlgi alanları: ${filters.interests.join(', ')}`);

    if (weather) {
      baglam.push(
        `Hava tahmini (${weather.date}): ${weather.description}` +
          (weather.temperatureMax !== null ? `, en yüksek ${Math.round(weather.temperatureMax)}°C` : '') +
          (weather.precipitationProbability !== null
            ? `, yağış ihtimali %${weather.precipitationProbability}`
            : ''),
      );
    } else if (filters.statedWeather) {
      baglam.push(`Kullanıcının belirttiği hava: ${filters.statedWeather}`);
    }

    if (filters.requiresIndoor) {
      baglam.push('Kapalı (veya kısmen kapalı) mekânlar filtrelendi.');
    }

    baglam.push('', 'Önerebileceğin aktiviteler:');
    baglam.push(
      products.length === 0
        ? '(liste boş — kriterlere uyan aktivite bulunamadı)'
        : JSON.stringify(
            products.map((p) => ({
              ad: p.name,
              kategori: p.category?.name ?? '',
              ilce: p.district,
              mekan: p.venueSetting,
              enDusukYas: p.minAge,
              sure: `${p.durationMinutes} dk`,
              fiyat: `${p.price} ${p.currency}`,
              puan: p.rating,
              ozet: (p.description ?? '').replace(/\s+/g, ' ').slice(0, 220),
            })),
            null,
            1,
          ),
    );

    try {
      const { content } = await this.openRouterService.chat(
        [
          { role: 'system', content: ANSWER_SYSTEM_PROMPT },
          { role: 'user', content: baglam.join('\n') },
        ],
        { temperature: 0.5, maxTokens: 1200 },
      );
      return content.trim();
    } catch (error) {
      this.logger.error(
        `Cevap üretilemedi: ${error instanceof Error ? error.message : String(error)}`,
      );
      // Model ulaşılamıyorsa ürünler yine de dönsün; kullanıcı boş ekran görmesin.
      return products.length
        ? `${filters.city} için ${products.length} aktivite buldum, aşağıda listeledim.`
        : 'Kriterlerinize uyan aktivite bulamadım.';
    }
  }

  private toSuggestion(product: Product): ChatSuggestionDto {
    return {
      id: product.id,
      name: product.name,
      category: product.category?.name ?? null,
      city: product.city,
      district: product.district,
      price: product.price,
      currency: product.currency,
      rating: product.rating,
      durationMinutes: product.durationMinutes,
      venueSetting: product.venueSetting,
      minAge: product.minAge,
      imageUrl: product.imageUrl,
      bookingUrl: product.bookingUrl,
    };
  }

  private plainAnswer(
    answer: string,
    filters: ChatFilters,
    weather: WeatherForecast | null,
    baslangic: number,
    needsCity = false,
  ): ChatAnswerDto {
    return {
      answer,
      filters,
      weather,
      suggestions: [],
      needsCity,
      generationMs: Date.now() - baslangic,
    };
  }
}
