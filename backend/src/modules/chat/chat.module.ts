import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { ProductsModule } from '../products/products.module';
import { WeatherModule } from '../weather/weather.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { QueryUnderstandingService } from './query-understanding.service';

@Module({
  imports: [AiModule, ProductsModule, WeatherModule],
  controllers: [ChatController],
  providers: [QueryUnderstandingService, ChatService],
})
export class ChatModule {}
