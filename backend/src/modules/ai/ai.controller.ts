import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Public, RequireScopes } from '../../common/decorators';
import { ApiKeyScope } from '../../common/enums';
import { AiService } from './ai.service';
import { AiStatusDto, ProductSuggestionDto, SuggestProductsDto } from './dto';

@ApiTags('AI')
@Controller({ path: 'ai', version: '1' })
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Public()
  @Get('status')
  @RequireScopes(ApiKeyScope.AI_SUGGEST)
  @ApiOperation({ summary: 'AI servis durumu' })
  getStatus(): AiStatusDto {
    return this.aiService.getStatus();
  }

  @Post('suggestions')
  @HttpCode(HttpStatus.OK)
  @RequireScopes(ApiKeyScope.AI_SUGGEST)
  @ApiBearerAuth()
  @ApiSecurity('api-key')
  @ApiOperation({ summary: 'Bağlama uygun Viofun aktivitelerini önerir' })
  suggest(@Body() dto: SuggestProductsDto): Promise<ProductSuggestionDto[]> {
    return this.aiService.suggestProducts(dto);
  }
}
