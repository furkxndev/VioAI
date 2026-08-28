import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VenueSetting } from '../../../common/enums';
import type { ChatFilters } from '../chat-query.interface';
import type { WeatherForecast } from '../../weather/weather.service';

export class ChatSuggestionDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty() name: string;
  @ApiPropertyOptional() category: string | null;
  @ApiProperty() city: string;
  @ApiPropertyOptional() district: string | null;
  @ApiProperty() price: number;
  @ApiProperty() currency: string;
  @ApiProperty() rating: number;
  @ApiProperty() durationMinutes: number;
  @ApiPropertyOptional({ enum: VenueSetting }) venueSetting: VenueSetting | null;
  @ApiPropertyOptional({ description: 'Katılım için en düşük yaş' }) minAge: number | null;
  @ApiPropertyOptional() imageUrl: string | null;
  @ApiPropertyOptional({ description: 'viofun.com bilet bağlantısı' }) bookingUrl: string | null;
}

export class ChatAnswerDto {
  @ApiProperty({ description: 'Kullanıcıya gösterilecek Türkçe cevap metni' })
  answer: string;

  @ApiProperty({ description: 'Sorudan çıkarılan arama kısıtları (şeffaflık için döner)' })
  filters: ChatFilters;

  @ApiPropertyOptional({ description: 'Kullanılan hava tahmini; yoksa null' })
  weather: WeatherForecast | null;

  @ApiProperty({ type: [ChatSuggestionDto] })
  suggestions: ChatSuggestionDto[];

  @ApiProperty({ description: 'true ise şehir belirlenemedi, kullanıcıdan istenmeli' })
  needsCity: boolean;

  @ApiProperty({ description: 'Toplam üretim süresi (ms)' })
  generationMs: number;
}
