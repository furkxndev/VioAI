import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Public, RequireScopes, Roles } from '../../common/decorators';
import { ApiKeyScope, UserRole } from '../../common/enums';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, QueryCategoriesDto, UpdateCategoryDto } from './dto';

@ApiTags('Categories')
@Controller({ path: 'categories', version: '1' })
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Get()
  @RequireScopes(ApiKeyScope.CATEGORIES_READ)
  @ApiSecurity('api-key')
  @ApiOperation({ summary: 'Kategorileri listeler' })
  findAll(@Query() query: QueryCategoriesDto) {
    return this.categoriesService.findAll(query);
  }

  @Public()
  @Get(':id')
  @RequireScopes(ApiKeyScope.CATEGORIES_READ)
  @ApiSecurity('api-key')
  @ApiOperation({ summary: 'Kategori detayı' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.findById(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kategori oluşturur (admin)' })
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Kategori günceller (admin)' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Kategori siler (admin)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.remove(id);
  }
}
