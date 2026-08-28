import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class QueryCategoriesDto {
  @ApiPropertyOptional({ description: 'Yalnızca aktif kategoriler' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value === 'true' : Boolean(value)))
  @IsBoolean()
  isActive?: boolean;
}
