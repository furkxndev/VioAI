import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser, RequireScopes, Roles } from '../../common/decorators';
import { ApiKeyScope, UserRole } from '../../common/enums';
import type { AuthenticatedRequest, AuthenticatedUser } from '../../common/interfaces/authenticated-request.interface';
import { GenerateRouteDto, QueryRoutesDto, UpdateRouteDto } from './dto';
import { RoutesService } from './routes.service';

@ApiTags('Routes')
@Controller({ path: 'routes', version: '1' })
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Post('generate')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @RequireScopes(ApiKeyScope.ROUTES_GENERATE)
  @ApiBearerAuth()
  @ApiSecurity('api-key')
  @ApiOperation({ summary: 'AI ile kişiselleştirilmiş rota üretir' })
  generate(@Body() dto: GenerateRouteDto, @Req() request: AuthenticatedRequest) {
    return this.routesService.generate(dto, request.user?.id ?? null);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kullanıcının rotalarını listeler' })
  findAll(@Query() query: QueryRoutesDto, @CurrentUser('id') userId: string) {
    return this.routesService.findAllForUser(userId, query);
  }

  @Get('all')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tüm rotaları listeler (admin)' })
  findAllAdmin(@Query() query: QueryRoutesDto) {
    return this.routesService.findAll(query);
  }

  @Get(':id')
  @RequireScopes(ApiKeyScope.ROUTES_READ)
  @ApiBearerAuth()
  @ApiSecurity('api-key')
  @ApiOperation({ summary: 'Rota detayı (duraklarıyla birlikte)' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() request: AuthenticatedRequest) {
    if (request.apiKey) {
      return this.routesService.findById(id);
    }

    return this.routesService.findOwned(id, request.user as AuthenticatedUser);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Rota bilgilerini günceller' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRouteDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.routesService.update(id, dto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Rotayı siler' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.routesService.remove(id, user);
  }
}
