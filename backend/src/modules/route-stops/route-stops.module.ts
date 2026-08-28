import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from '../products/products.module';
import { RoutesModule } from '../routes/routes.module';
import { RouteStop } from './entities/route-stop.entity';
import { RouteStopsController } from './route-stops.controller';
import { RouteStopsService } from './route-stops.service';

@Module({
  imports: [TypeOrmModule.forFeature([RouteStop]), RoutesModule, ProductsModule],
  controllers: [RouteStopsController],
  providers: [RouteStopsService],
  exports: [RouteStopsService],
})
export class RouteStopsModule {}
