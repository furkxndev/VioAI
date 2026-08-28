import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';
const TIMEOUT_MS = 6000;
/** Open-Meteo ücretsiz katmanda 16 güne kadar tahmin veriyor. */
const MAX_FORECAST_DAYS = 15;

export type WeatherCondition = 'clear' | 'cloudy' | 'fog' | 'rain' | 'snow' | 'storm';

export interface WeatherForecast {
  date: string;
  condition: WeatherCondition;
  /** Islak hava: yağmur, kar, fırtına. Kapalı mekân önerisini tetikler. */
  isWet: boolean;
  temperatureMax: number | null;
  temperatureMin: number | null;
  precipitationProbability: number | null;
  description: string;
}

/** WMO hava kodları → sadeleştirilmiş durum. */
const WMO: Array<[number[], WeatherCondition, string]> = [
  [[0], 'clear', 'açık'],
  [[1, 2], 'clear', 'parçalı bulutlu'],
  [[3], 'cloudy', 'kapalı'],
  [[45, 48], 'fog', 'sisli'],
  [[51, 53, 55, 56, 57], 'rain', 'çiseleyen yağmur'],
  [[61, 63, 65, 66, 67], 'rain', 'yağmurlu'],
  [[80, 81, 82], 'rain', 'sağanak yağmurlu'],
  [[71, 73, 75, 77, 85, 86], 'snow', 'karlı'],
  [[95, 96, 99], 'storm', 'gök gürültülü fırtına'],
];

const WET: WeatherCondition[] = ['rain', 'snow', 'storm'];

interface OpenMeteoResponse {
  daily?: {
    time?: string[];
    weathercode?: number[];
    temperature_2m_max?: (number | null)[];
    temperature_2m_min?: (number | null)[];
    precipitation_probability_max?: (number | null)[];
  };
}

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  /** Şehir → koordinat. Katalogdaki ürünlerden hesaplanır, süreç boyunca saklanır. */
  private cityCoordinates: Map<string, { latitude: number; longitude: number }> | null = null;

  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  /**
   * Verilen şehir ve tarih için hava tahmini döner.
   * Servis ulaşılamazsa veya tarih kapsam dışıysa null döner — sohbet akışı
   * havayı bilmeden devam eder, hata fırlatılmaz.
   */
  async getForecast(city: string, date: string): Promise<WeatherForecast | null> {
    const coordinates = await this.resolveCity(city);
    if (!coordinates) {
      this.logger.debug(`Şehrin koordinatı bulunamadı: ${city}`);
      return null;
    }

    if (!this.isWithinForecastRange(date)) {
      return null;
    }

    const params = new URLSearchParams({
      latitude: coordinates.latitude.toFixed(4),
      longitude: coordinates.longitude.toFixed(4),
      daily: 'weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
      timezone: 'Europe/Istanbul',
      start_date: date,
      end_date: date,
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(`${OPEN_METEO_URL}?${params.toString()}`, {
        signal: controller.signal,
      });

      if (!response.ok) {
        this.logger.warn(`Open-Meteo yanıtı başarısız: ${response.status}`);
        return null;
      }

      const payload = (await response.json()) as OpenMeteoResponse;
      const daily = payload.daily;

      if (!daily?.time?.length || daily.weathercode?.[0] === undefined) {
        return null;
      }

      const code = daily.weathercode[0];
      const [, condition, description] = WMO.find(([codes]) => codes.includes(code)) ?? [
        [],
        'cloudy' as WeatherCondition,
        'değişken',
      ];

      return {
        date: daily.time[0],
        condition,
        isWet: WET.includes(condition),
        temperatureMax: daily.temperature_2m_max?.[0] ?? null,
        temperatureMin: daily.temperature_2m_min?.[0] ?? null,
        precipitationProbability: daily.precipitation_probability_max?.[0] ?? null,
        description,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        this.logger.warn('Open-Meteo isteği zaman aşımına uğradı');
      } else {
        this.logger.warn(
          `Hava tahmini alınamadı: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }

  /** Tarih bugünden itibaren tahmin penceresinde mi. */
  private isWithinForecastRange(date: string): boolean {
    const hedef = new Date(`${date}T00:00:00`);
    if (Number.isNaN(hedef.getTime())) {
      return false;
    }

    const bugun = new Date();
    bugun.setHours(0, 0, 0, 0);
    const farkGun = Math.round((hedef.getTime() - bugun.getTime()) / 86_400_000);

    return farkGun >= 0 && farkGun <= MAX_FORECAST_DAYS;
  }

  /**
   * Şehrin koordinatını katalogdaki ürünlerin ortalamasından bulur.
   * Ayrı bir coğrafi servise ihtiyaç duymadan, elimizdeki veriden türetilir.
   */
  private async resolveCity(
    city: string,
  ): Promise<{ latitude: number; longitude: number } | null> {
    if (!this.cityCoordinates) {
      const rows = await this.productsRepository
        .createQueryBuilder('product')
        .select('LOWER(product.city)', 'city')
        .addSelect('AVG(product.latitude)', 'lat')
        .addSelect('AVG(product.longitude)', 'lng')
        .where('product.isActive = true')
        .groupBy('LOWER(product.city)')
        .getRawMany<{ city: string; lat: string; lng: string }>();

      this.cityCoordinates = new Map(
        rows.map((r) => [r.city, { latitude: Number(r.lat), longitude: Number(r.lng) }]),
      );
    }

    return this.cityCoordinates.get(city.toLocaleLowerCase('tr')) ?? null;
  }
}
