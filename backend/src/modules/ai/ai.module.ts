import { Module } from '@nestjs/common';
import { ProductsModule } from '../products/products.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { EmbeddingService } from './embedding.service';
import { ItineraryGeneratorService } from './itinerary-generator.service';
import { OpenRouterService } from './openrouter.service';
import { ProductMatcherService } from './product-matcher.service';

@Module({
  imports: [ProductsModule],
  controllers: [AiController],
  providers: [
    OpenRouterService,
    EmbeddingService,
    ItineraryGeneratorService,
    ProductMatcherService,
    AiService,
  ],
  exports: [AiService, EmbeddingService],
})
export class AiModule {}
