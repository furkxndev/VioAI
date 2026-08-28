import { Injectable } from '@nestjs/common';
import { CategoriesService } from '../categories/categories.service';
import { ProductsService } from '../products/products.service';
import { RoutesService } from '../routes/routes.service';
import { UsersService } from '../users/users.service';
import { AdminStatsDto } from './dto';

const TOP_CITIES_LIMIT = 5;

@Injectable()
export class AdminService {
  constructor(
    private readonly usersService: UsersService,
    private readonly categoriesService: CategoriesService,
    private readonly productsService: ProductsService,
    private readonly routesService: RoutesService,
  ) {}

  async getStats(): Promise<AdminStatsDto> {
    const [
      totalUsers,
      totalCategories,
      totalProducts,
      activeProducts,
      aiRecommendableProducts,
      totalRoutes,
      cities,
      categoryBreakdown,
    ] = await Promise.all([
      this.usersService.countAll(),
      this.categoriesService.countAll(),
      this.productsService.countAll(),
      this.productsService.countActive(),
      this.productsService.countAiRecommendable(),
      this.routesService.countAll(),
      this.productsService.listCities(),
      this.productsService.listCategoryBreakdown(),
    ]);

    return {
      totalUsers,
      totalCategories,
      totalProducts,
      activeProducts,
      aiRecommendableProducts,
      totalRoutes,
      topCities: cities
        .map((row) => ({ city: row.city, count: Number(row.count) }))
        .sort((a, b) => b.count - a.count)
        .slice(0, TOP_CITIES_LIMIT),
      categoryBreakdown: categoryBreakdown.map((row) => ({
        categoryId: row.categoryId,
        name: row.name,
        color: row.color,
        count: Number(row.count),
      })),
    };
  }
}
