import { Injectable, Logger, UnprocessableEntityException } from '@nestjs/common';
import { extractJsonObject } from '../../common/utils';
import type {
  GeneratedDay,
  GeneratedItinerary,
  GeneratedStop,
  ItineraryRequest,
  ItineraryResult,
} from './interfaces/itinerary.interface';
import { OpenRouterService } from './openrouter.service';

const SYSTEM_PROMPT = `Sen VioAI'sın; Viofun için çalışan uzman bir seyahat rotası planlayıcısısın.
Görevin, kullanıcının verdiği kısıtlara göre gerçekçi, gün gün planlanmış bir şehir gezi rotası üretmek.

Kurallar:
- Yalnızca gerçekten var olan, herkese açık mekânları öner (müze, meydan, park, cadde, restoran, sahil vb.).
- Bilet veya tur ürünü uydurma. Fiyatlı bir "Viofun aktivitesi" varmış gibi davranma; bu ürünler sisteme sonradan eklenir.
- Koordinatlar mekânın gerçek konumuna makul ölçüde yakın olmalı. Emin değilsen şehir merkezine yakın bir değer ver.
- Aynı gün içindeki duraklar coğrafi olarak birbirine yakın olmalı ve saatler kronolojik ilerlemeli.
- Tahmini maliyetleri kullanıcının para birimi ve kişi sayısı üzerinden, toplam tutar olarak ver.
- Yanıtın SADECE geçerli bir JSON nesnesi olsun; açıklama, markdown veya kod bloğu ekleme.

JSON şeması:
{
  "title": string,
  "summary": string,
  "estimatedTotalCost": number,
  "days": [
    {
      "day": number,
      "theme": string,
      "stops": [
        {
          "title": string,
          "description": string,
          "category": string,
          "startTime": "HH:mm",
          "durationMinutes": number,
          "estimatedCost": number,
          "latitude": number,
          "longitude": number,
          "address": string
        }
      ]
    }
  ]
}`;

const PACE_STOPS: Record<string, string> = {
  relaxed: 'günde 3-4 durak',
  balanced: 'günde 4-5 durak',
  intense: 'günde 6-7 durak',
};

@Injectable()
export class ItineraryGeneratorService {
  private readonly logger = new Logger(ItineraryGeneratorService.name);

  constructor(private readonly openRouterService: OpenRouterService) {}

  async generate(request: ItineraryRequest): Promise<ItineraryResult> {
    const startedAt = Date.now();

    const { content, model } = await this.openRouterService.chat(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: this.buildUserPrompt(request) },
      ],
      { temperature: 0.6, maxTokens: 6000, responseFormat: 'json_object' },
    );

    const itinerary = this.parse(content, request);

    return { itinerary, model, generationMs: Date.now() - startedAt };
  }

  private buildUserPrompt(request: ItineraryRequest): string {
    const lines = [
      `Şehir: ${request.city}`,
      `Seyahat süresi: ${request.days} gün`,
      `Toplam bütçe: ${request.budget} ${request.currency}`,
      `Kişi sayısı: ${request.travelers}`,
      `İlgi alanları: ${request.interests.length ? request.interests.join(', ') : 'genel'}`,
      `Ulaşım tercihi: ${request.transportMode}`,
      `Tempo: ${request.pace} (${PACE_STOPS[request.pace] ?? 'günde 4-5 durak'})`,
    ];

    if (request.startDate) {
      lines.push(`Başlangıç tarihi: ${request.startDate}`);
    }

    if (request.notes) {
      lines.push(`Ek notlar: ${request.notes}`);
    }

    lines.push(
      `Tam olarak ${request.days} gün üret ve her gün için duraklar arasındaki geçişleri ${request.transportMode} tercihine uygun planla.`,
    );

    return lines.join('\n');
  }

  private parse(raw: string, request: ItineraryRequest): GeneratedItinerary {
    let parsed: unknown;

    try {
      parsed = extractJsonObject(raw);
    } catch (error) {
      this.logger.error(`AI yanıtı ayrıştırılamadı: ${error instanceof Error ? error.message : ''}`);
      throw new UnprocessableEntityException('AI yanıtı beklenen biçimde değil, lütfen tekrar deneyin');
    }

    const candidate = parsed as Partial<GeneratedItinerary>;

    if (!Array.isArray(candidate.days) || candidate.days.length === 0) {
      throw new UnprocessableEntityException('AI geçerli bir rota üretemedi, lütfen tekrar deneyin');
    }

    const days = candidate.days
      .slice(0, request.days)
      .map((day, index) => this.normalizeDay(day, index))
      .filter((day) => day.stops.length > 0);

    if (days.length === 0) {
      throw new UnprocessableEntityException('AI geçerli bir rota üretemedi, lütfen tekrar deneyin');
    }

    return {
      title: this.toText(candidate.title, `${request.days} Günde ${request.city}`).slice(0, 200),
      summary: this.toText(candidate.summary, ''),
      estimatedTotalCost: this.toNumber(candidate.estimatedTotalCost, 0),
      days,
    };
  }

  private normalizeDay(day: Partial<GeneratedDay>, index: number): GeneratedDay {
    const stops = Array.isArray(day.stops) ? day.stops : [];

    return {
      day: this.toNumber(day.day, index + 1),
      theme: this.toText(day.theme, ''),
      stops: stops
        .map((stop) => this.normalizeStop(stop))
        .filter((stop): stop is GeneratedStop => stop !== null),
    };
  }

  private normalizeStop(stop: Partial<GeneratedStop>): GeneratedStop | null {
    const title = this.toText(stop.title, '').trim();
    const latitude = this.toNumber(stop.latitude, Number.NaN);
    const longitude = this.toNumber(stop.longitude, Number.NaN);

    if (!title || Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return null;
    }

    return {
      title: title.slice(0, 200),
      description: this.toText(stop.description, '').slice(0, 2000),
      category: this.toText(stop.category, 'genel').slice(0, 120),
      startTime: /^\d{2}:\d{2}$/.test(String(stop.startTime)) ? String(stop.startTime) : '10:00',
      durationMinutes: Math.min(Math.max(this.toNumber(stop.durationMinutes, 60), 15), 600),
      estimatedCost: Math.max(this.toNumber(stop.estimatedCost, 0), 0),
      latitude,
      longitude,
      address: this.toText(stop.address, '').slice(0, 300) || undefined,
    };
  }

  private toText(value: unknown, fallback: string): string {
    return typeof value === 'string' && value.length > 0 ? value : fallback;
  }

  private toNumber(value: unknown, fallback: number): number {
    const parsed = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
}
