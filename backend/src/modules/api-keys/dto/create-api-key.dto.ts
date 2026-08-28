import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsDateString, IsEnum, IsOptional, IsString, Length, MaxLength } from 'class-validator';
import { ApiKeyScope } from '../../../common/enums';

export class CreateApiKeyDto {
  @ApiProperty({ example: 'Viofun Mobil Uygulama' })
  @IsString()
  @Length(3, 120)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ enum: ApiKeyScope, isArray: true })
  @IsArray()
  @ArrayNotEmpty({ message: 'En az bir yetki seçilmelidir' })
  @IsEnum(ApiKeyScope, { each: true })
  scopes: ApiKeyScope[];

  @ApiPropertyOptional({ description: 'ISO 8601 tarih' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
