import { Injectable, Logger } from '@nestjs/common';
import { extractJsonObject } from '../../common/utils';
import { OpenRouterService } from '../ai/openrouter.service';
import type { ChatFilters, ChatUnderstanding } from './chat-query.interface';

const SYSTEM_PROMPT = `Sen VioAI'sın; kullanıcının serbest metinli sorusunu aktivite arama
kısıtlarına çeviren bir ayrıştırıcısın. Cevap YAZMAZSIN, sadece kısıtları çıkarırsın.

Kurallar:
- city: Soruda geçen Türkiye şehri. Geçmiyorsa null. İlçe geçiyorsa bağlı olduğu ili yaz
  (Konyaaltı → Antalya, Kadıköy → İstanbul).
- requiresIndoor: Kullanıcı yağmur, kar, fırtına, soğuk gibi bir hava belirtiyorsa veya
  doğrudan kapalı mekân istiyorsa true. Güneşli/açık hava istiyorsa false. Belirtmemişse false.
- childAge: Gruptaki EN KÜÇÜK çocuğun yaşı. "3 yaşındaki çocuğumla" → 3. Çocuk yoksa null.
  "çocuklarımla" gibi yaş verilmemişse null bırak, tahmin etme.
- travelers: Toplam kişi sayısı. Belirtilmemişse null.
- budget ve currency: Bütçe geçiyorsa sayı ve para birimi ("TRY"). Yoksa null.
- interests: Kullanıcının ilgi/istek ifadeleri, kısa öbekler halinde ("el işi", "tarih",
  "sakin bir gün", "çocuk dostu"). Yoksa boş dizi.
- date: Bugünün tarihi sana verilecek. "yarın", "bu cumartesi", "3 gün sonra" gibi
  ifadeleri YYYY-MM-DD biçimine çevir. Tarih geçmiyorsa null.
- statedWeather: Kullanıcının kendi cümlesinde geçen hava ifadesi ("yağmurlu", "karlı").
  Geçmiyorsa null. Sen hava tahmini yapma.
- isActivitySearch: Soru bir gezilecek yer / aktivite arayışıysa true. Selamlama, alakasız
  soru veya sistemle ilgili soruysa false.
- restated: Kullanıcının ne istediğini tek cümlede, kendi cümlesine sadık kalarak özetle.
- Yanıtın SADECE geçerli bir JSON nesnesi olsun; açıklama veya kod bloğu ekleme.

JSON şeması:
{
  "isActivitySearch": boolean,
  "restated": string,
  "city": string | null,
  "requiresIndoor": boolean,
  "childAge": number | null,
  "travelers": number | null,
  "budget": number | null,
  "currency": string | null,
  "interests": string[],
  "date": string | null,
  "statedWeather": string | null
}`;

@Injectable()
export class QueryUnderstandingService {
  private readonly logger = new Logger(QueryUnderstandingService.name);

  constructor(private readonly openRouterService: OpenRouterService) {}

  async understand(message: string, cityHint?: string): Promise<ChatUnderstanding> {
    const bugun = new Date().toISOString().slice(0, 10);
    const satirlar = [`Bugünün tarihi: ${bugun}`];

    if (cityHint) {
      satirlar.push(`Kullanıcının seçili şehri: ${cityHint} (soruda şehir geçmiyorsa bunu kullan)`);
    }

    satirlar.push(`Kullanıcının sorusu: ${message}`);

    const { content } = await this.openRouterService.chat(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: satirlar.join('\n') },
      ],
      { temperature: 0.1, maxTokens: 800, responseFormat: 'json_object' },
    );

    return this.parse(content, cityHint);
  }

  /**
   * Model çıktısını güvenli hale getirir. Ayrıştırma başarısız olursa istek
   * düşmez; şehir ipucuyla boş bir filtre döner ve kullanıcıdan bilgi istenir.
   */
  private parse(raw: string, cityHint?: string): ChatUnderstanding {
    let parsed: Record<string, unknown>;

    try {
      parsed = extractJsonObject(raw) as Record<string, unknown>;
    } catch (error) {
      this.logger.warn(
        `Soru ayrıştırılamadı: ${error instanceof Error ? error.message : String(error)}`,
      );
      return {
        isActivitySearch: false,
        restated: '',
        filters: this.emptyFilters(cityHint),
      };
    }

    const filters: ChatFilters = {
      city: this.toText(parsed.city) ?? cityHint ?? null,
      requiresIndoor: parsed.requiresIndoor === true,
      childAge: this.toInt(parsed.childAge, 0, 17),
      travelers: this.toInt(parsed.travelers, 1, 20),
      budget: this.toNumber(parsed.budget),
      currency: this.toText(parsed.currency)?.toUpperCase().slice(0, 3) ?? null,
      interests: this.toStringArray(parsed.interests),
      date: this.toDate(parsed.date),
      statedWeather: this.toText(parsed.statedWeather),
    };

    return {
      isActivitySearch: parsed.isActivitySearch !== false,
      restated: this.toText(parsed.restated)?.slice(0, 300) ?? '',
      filters,
    };
  }

  private emptyFilters(cityHint?: string): ChatFilters {
    return {
      city: cityHint ?? null,
      requiresIndoor: false,
      childAge: null,
      travelers: null,
      budget: null,
      currency: null,
      interests: [],
      date: null,
      statedWeather: null,
    };
  }

  private toText(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
  }

  private toInt(value: unknown, min: number, max: number): number | null {
    // Number(null) === 0 olduğu için null/undefined önce elenmeli; aksi hâlde
    // "çocuk yok" bilgisi childAge=0'a dönüşür ve yaş sınırlı ürünler boşuna elenir.
    if (value === null || value === undefined || value === '') return null;
    const sayi = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(sayi)) return null;
    return Math.min(Math.max(Math.round(sayi), min), max);
  }

  private toNumber(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null;
    const sayi = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(sayi) && sayi > 0 ? sayi : null;
  }

  private toStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value
      .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
      .map((v) => v.trim().slice(0, 60))
      .slice(0, 8);
  }

  private toDate(value: unknown): string | null {
    const metin = this.toText(value);
    return metin && /^\d{4}-\d{2}-\d{2}$/.test(metin) ? metin : null;
  }
}
