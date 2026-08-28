import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsHexColor, IsInt, IsOptional, IsString, Length, MaxLength, Min } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Müze & Sanat' })
  @IsString()
  @Length(2, 120)
  name: string;

  @ApiPropertyOptional({ description: 'Boş bırakılırsa isimden üretilir' })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ example: 'landmark' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  icon?: string;

  @ApiPropertyOptional({ example: '#7C3AED' })
  @IsOptional()
  @IsHexColor()
  color?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
