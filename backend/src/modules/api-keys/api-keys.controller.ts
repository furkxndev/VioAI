import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Roles } from '../../common/decorators';
import { UserRole } from '../../common/enums';
import { ApiKeysService } from './api-keys.service';
import { ApiKeyCreatedDto, CreateApiKeyDto, UpdateApiKeyDto } from './dto';

@ApiTags('API Keys')
@ApiBearerAuth()
@Roles(UserRole.ADMIN)
@Controller({ path: 'api-keys', version: '1' })
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Get()
  @ApiOperation({ summary: 'API anahtarlarını listeler' })
  findAll() {
    return this.apiKeysService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Yeni API anahtarı üretir' })
  create(@Body() dto: CreateApiKeyDto, @CurrentUser('id') userId: string): Promise<ApiKeyCreatedDto> {
    return this.apiKeysService.create(dto, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'API anahtarı detayı' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.apiKeysService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'API anahtarını günceller' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateApiKeyDto) {
    return this.apiKeysService.update(id, dto);
  }

  @Post(':id/revoke')
  @ApiOperation({ summary: 'API anahtarını devre dışı bırakır' })
  revoke(@Param('id', ParseUUIDPipe) id: string) {
    return this.apiKeysService.revoke(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'API anahtarını siler' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.apiKeysService.remove(id);
  }
}
