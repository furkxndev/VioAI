import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto';

export enum ProductSortBy {
  CREATED_AT = 'createdAt',
  PRICE = 'price',
  RATING = 'rating',
  POPULARITY = 'popularityScore',
  NAME = 'name',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

const toBoolean = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value === 'true' : value;

const toArray = ({ value }: { value: unknown }): unknown => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return value.split(',').map((item) => item.trim()).filter(Boolean);
  return value;
};

export class QueryProductsDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'İsim ve açıklamada arama' })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  search?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ example: 'İstanbul' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string;

  @ApiPropertyOptional({ type: [String], description: 'Virgülle ayrılmış etiketler' })
  @IsOptional()
  @Transform(toArray)
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  isAiRecommendable?: boolean;

  @ApiPropertyOptional({ description: 'Yakınlık filtresi merkezi' })
  @IsOptional()
  @Type(() => Number)
  @IsLatitude()
  latitude?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsLongitude()
  longitude?: number;

  @ApiPropertyOptional({ description: 'Yarıçap (km)', default: 10 })
  @ValidateIf((dto: QueryProductsDto) => dto.latitude !== undefined)
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  radiusKm?: number;

  @ApiPropertyOptional({ enum: ProductSortBy, default: ProductSortBy.POPULARITY })
  @IsOptional()
  @IsEnum(ProductSortBy)
  sortBy?: ProductSortBy;

  @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.DESC })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;
}
