import { Module } from '@nestjs/common';
import { CategoriesModule } from '../categories/categories.module';
import { ProductsModule } from '../products/products.module';
import { RoutesModule } from '../routes/routes.module';
import { UsersModule } from '../users/users.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [UsersModule, CategoriesModule, ProductsModule, RoutesModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
