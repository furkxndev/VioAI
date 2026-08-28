import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from './common/decorators';

@ApiTags('Health')
@Controller({ version: VERSION_NEUTRAL })
export class AppController {
  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Servis sağlık kontrolü' })
  health() {
    return { status: 'ok', service: 'vioai-api', timestamp: new Date().toISOString() };
  }
}
