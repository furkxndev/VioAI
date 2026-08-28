import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../../products/entities/product.entity';

export class ProductSuggestionDto {
  @ApiProperty({ type: Product })
  product: Product;

  @ApiProperty({ example: 78.5 })
  score: number;

  @ApiProperty()
  reason: string;

  @ApiProperty({ example: 1.2 })
  distanceKm: number;
}
