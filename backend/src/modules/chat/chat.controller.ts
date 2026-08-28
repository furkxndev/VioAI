import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { RequireScopes } from '../../common/decorators';
import { ApiKeyScope } from '../../common/enums';
import { ChatService } from './chat.service';
import { ChatAnswerDto, ChatQueryDto } from './dto';

@ApiTags('Chat')
@Controller({ path: 'chat', version: '1' })
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  // Her istek iki LLM çağrısı yapıyor; rota üretiminden daha sıkı sınırlıyoruz.
  @Throttle({ default: { limit: 15, ttl: 60_000 } })
  @RequireScopes(ApiKeyScope.AI_SUGGEST)
  @ApiBearerAuth()
  @ApiSecurity('api-key')
  @ApiOperation({
    summary: 'Serbest metinli soruya göre aktivite önerir',
    description:
      'Soruyu yapılandırılmış kısıtlara çevirir (şehir, kapalı alan, yaş, bütçe), ' +
      'katalogdan filtreler ve yalnızca bulunan ürünlere dayanan bir cevap üretir. ' +
      'Tarih verilip hava belirtilmemişse Open-Meteo tahminine bakılır.',
  })
  ask(@Body() dto: ChatQueryDto): Promise<ChatAnswerDto> {
    return this.chatService.ask(dto);
  }
}
