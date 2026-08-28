import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class ToggleAiRecommendableDto {
  @ApiProperty({ description: 'Ürün AI önerilerine dahil edilsin mi' })
  @IsBoolean()
  isAiRecommendable: boolean;
}
