import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/entities/product.entity';
import { WeatherService } from './weather.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  providers: [WeatherService],
  exports: [WeatherService],
})
export class WeatherModule {}
