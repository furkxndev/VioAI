import { ApiProperty } from '@nestjs/swagger';

export class AdminCityStatDto {
  @ApiProperty()
  city: string;

  @ApiProperty()
  count: number;
}

export class AdminCategoryStatDto {
  @ApiProperty()
  categoryId: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  color: string | null;

  @ApiProperty()
  count: number;
}

export class AdminStatsDto {
  @ApiProperty()
  totalUsers: number;

  @ApiProperty()
  totalCategories: number;

  @ApiProperty()
  totalProducts: number;

  @ApiProperty()
  activeProducts: number;

  @ApiProperty()
  aiRecommendableProducts: number;

  @ApiProperty()
  totalRoutes: number;

  @ApiProperty({ type: [AdminCityStatDto] })
  topCities: AdminCityStatDto[];

  @ApiProperty({ type: [AdminCategoryStatDto] })
  categoryBreakdown: AdminCategoryStatDto[];
}
