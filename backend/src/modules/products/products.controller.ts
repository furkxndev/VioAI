import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Public, RequireScopes, Roles } from '../../common/decorators';
import { ApiKeyScope, UserRole } from '../../common/enums';
import {
  CreateProductDto,
  QueryProductsDto,
  ToggleAiRecommendableDto,
  UpdateProductDto,
} from './dto';
import { ProductsService } from './products.service';

@ApiTags('Products')
@Controller({ path: 'products', version: '1' })
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get()
  @RequireScopes(ApiKeyScope.PRODUCTS_READ)
  @ApiSecurity('api-key')
  @ApiOperation({ summary: 'Viofun ürünlerini listeler' })
  findAll(@Query() query: QueryProductsDto) {
    return this.productsService.findAll(query);
  }

  @Public()
  @Get('cities')
  @RequireScopes(ApiKeyScope.PRODUCTS_READ)
  @ApiSecurity('api-key')
  @ApiOperation({ summary: 'Ürün bulunan şehirleri listeler' })
  async listCities() {
    const rows = await this.productsService.listCities();

    return rows
      .map((row) => ({ city: row.city, count: Number(row.count), imageUrl: row.imageUrl }))
      .sort((a, b) => b.count - a.count || a.city.localeCompare(b.city, 'tr'));
  }

  @Public()
  @Get(':id')
  @RequireScopes(ApiKeyScope.PRODUCTS_READ)
  @ApiSecurity('api-key')
  @ApiOperation({ summary: 'Ürün detayı' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findById(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @RequireScopes(ApiKeyScope.PRODUCTS_WRITE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ürün oluşturur (admin)' })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @RequireScopes(ApiKeyScope.PRODUCTS_WRITE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ürün günceller (admin)' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Patch(':id/ai-recommendable')
  @Roles(UserRole.ADMIN)
  @RequireScopes(ApiKeyScope.PRODUCTS_WRITE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ürünün AI önerilebilirliğini değiştirir (admin)' })
  setAiRecommendable(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ToggleAiRecommendableDto) {
    return this.productsService.setAiRecommendable(id, dto.isAiRecommendable);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @RequireScopes(ApiKeyScope.PRODUCTS_WRITE)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Ürün siler (admin)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }
}
