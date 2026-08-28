import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class ChatQueryDto {
  @ApiProperty({
    example: 'yarın hava yağmurlu, 3 yaşındaki çocuğumla Antalya’da nereye gidebilirim?',
    description: 'Kullanıcının serbest metinli sorusu',
  })
  @IsString()
  @Length(3, 500)
  message: string;

  @ApiPropertyOptional({
    example: 'Antalya',
    description: 'Soruda şehir geçmezse kullanılacak varsayılan şehir',
  })
  @IsOptional()
  @IsString()
  @Length(2, 120)
  city?: string;
}
