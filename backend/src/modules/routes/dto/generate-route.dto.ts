import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { TransportMode, TravelPace } from '../../../common/enums';

export class GenerateRouteDto {
  @ApiProperty({ example: 'İstanbul' })
  @IsString()
  @Length(2, 120)
  city: string;

  @ApiProperty({ example: 3, minimum: 1, maximum: 14 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(14)
  days: number;

  @ApiProperty({ example: 8000 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  budget: number;

  @ApiPropertyOptional({ example: 'TRY', default: 'TRY' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @ApiProperty({ example: 2, minimum: 1, maximum: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  travelers: number;

  @ApiPropertyOptional({ type: [String], example: ['tarih', 'gastronomi', 'manzara'] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  interests?: string[];

  @ApiProperty({ enum: TransportMode, default: TransportMode.MIXED })
  @IsEnum(TransportMode)
  transportMode: TransportMode;

  @ApiPropertyOptional({ enum: TravelPace, default: TravelPace.BALANCED })
  @IsOptional()
  @IsEnum(TravelPace)
  pace?: TravelPace;

  @ApiPropertyOptional({ example: '2026-09-12' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Serbest metin ek istekler' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
