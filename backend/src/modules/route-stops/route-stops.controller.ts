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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-request.interface';
import {
  AddProductStopDto,
  CreateRouteStopDto,
  ReorderStopsDto,
  ToggleInclusionDto,
  UpdateRouteStopDto,
} from './dto';
import { RouteStopsService } from './route-stops.service';

@ApiTags('Route Stops')
@ApiBearerAuth()
@Controller({ path: 'routes/:routeId/stops', version: '1' })
export class RouteStopsController {
  constructor(private readonly routeStopsService: RouteStopsService) {}

  @Get()
  @ApiOperation({ summary: 'Rotanın duraklarını listeler' })
  findAll(@Param('routeId', ParseUUIDPipe) routeId: string, @CurrentUser() user: AuthenticatedUser) {
    return this.routeStopsService.findAll(routeId, user);
  }

  @Post()
  @ApiOperation({ summary: 'Rotaya manuel durak ekler' })
  create(
    @Param('routeId', ParseUUIDPipe) routeId: string,
    @Body() dto: CreateRouteStopDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.routeStopsService.create(routeId, dto, user);
  }

  @Post('products')
  @ApiOperation({ summary: 'Viofun aktivitesini rotaya ekler' })
  addProduct(
    @Param('routeId', ParseUUIDPipe) routeId: string,
    @Body() dto: AddProductStopDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.routeStopsService.addProduct(routeId, dto, user);
  }

  @Patch('reorder')
  @ApiOperation({ summary: 'Durakların sırasını günceller' })
  reorder(
    @Param('routeId', ParseUUIDPipe) routeId: string,
    @Body() dto: ReorderStopsDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.routeStopsService.reorder(routeId, dto, user);
  }

  @Patch(':stopId')
  @ApiOperation({ summary: 'Durağı günceller' })
  update(
    @Param('routeId', ParseUUIDPipe) routeId: string,
    @Param('stopId', ParseUUIDPipe) stopId: string,
    @Body() dto: UpdateRouteStopDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.routeStopsService.update(routeId, stopId, dto, user);
  }

  @Patch(':stopId/inclusion')
  @ApiOperation({ summary: 'Durağın rotaya dahil olma durumunu değiştirir' })
  setInclusion(
    @Param('routeId', ParseUUIDPipe) routeId: string,
    @Param('stopId', ParseUUIDPipe) stopId: string,
    @Body() dto: ToggleInclusionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.routeStopsService.setInclusion(routeId, stopId, dto.isIncluded, user);
  }

  @Delete(':stopId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Durağı siler' })
  remove(
    @Param('routeId', ParseUUIDPipe) routeId: string,
    @Param('stopId', ParseUUIDPipe) stopId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.routeStopsService.remove(routeId, stopId, user);
  }
}
