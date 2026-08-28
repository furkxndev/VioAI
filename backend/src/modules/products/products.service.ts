import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { PaginatedResponseDto } from '../../common/dto';
import { CategoriesService } from '../categories/categories.service';
import {
  CreateProductDto,
  ProductSortBy,
  QueryProductsDto,
  SortOrder,
  UpdateProductDto,
} from './dto';
import { Product } from './entities/product.entity';

export interface CityStatRow {
  city: string;
  count: string;
  imageUrl: string | null;
}

export interface CategoryBreakdownRow {
  categoryId: string;
  name: string;
  color: string | null;
  count: string;
}

export interface AiCandidateFilter {
  city: string;
  categoryIds?: string[];
  tags?: string[];
  maxPrice?: number;
  limit?: number;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    await this.categoriesService.findById(dto.categoryId);

    return this.productsRepository.save(
      this.productsRepository.create({
        ...dto,
        currency: dto.currency ?? 'TRY',
        district: dto.district ?? null,
        address: dto.address ?? null,
        tags: dto.tags ?? [],
        imageUrl: dto.imageUrl ?? null,
        bookingUrl: dto.bookingUrl ?? null,
        durationMinutes: dto.durationMinutes ?? 60,
      }),
    );
  }

  async findAll(query: QueryProductsDto): Promise<PaginatedResponseDto<Product>> {
    const builder = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category');

    this.applyFilters(builder, query);

    const sortBy = query.sortBy ?? ProductSortBy.POPULARITY;
    const sortOrder = query.sortOrder ?? SortOrder.DESC;
    builder.orderBy(`product.${sortBy}`, sortOrder).addOrderBy('product.id', 'ASC');

    const [items, total] = await builder.skip(query.skip).take(query.limit).getManyAndCount();

    return new PaginatedResponseDto(items, total, query.page, query.limit);
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: { category: true },
    });

    if (!product) {
      throw new NotFoundException('Ürün bulunamadı');
    }

    return product;
  }

  findByIds(ids: string[]): Promise<Product[]> {
    if (ids.length === 0) {
      return Promise.resolve([]);
    }

    return this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.id IN (:...ids)', { ids })
      .getMany();
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findById(id);

    if (dto.categoryId && dto.categoryId !== product.categoryId) {
      await this.categoriesService.findById(dto.categoryId);
    }

    Object.assign(product, dto);

    return this.productsRepository.save(product);
  }

  async setAiRecommendable(id: string, isAiRecommendable: boolean): Promise<Product> {
    const product = await this.findById(id);
    product.isAiRecommendable = isAiRecommendable;
    return this.productsRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const result = await this.productsRepository.delete(id);

    if (!result.affected) {
      throw new NotFoundException('Ürün bulunamadı');
    }
  }

  findAiCandidates(filter: AiCandidateFilter): Promise<Product[]> {
    const builder = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.isActive = true')
      .andWhere('product.isAiRecommendable = true')
      .andWhere('product.city ILIKE :city', { city: filter.city });

    if (filter.categoryIds?.length) {
      builder.andWhere('product.categoryId IN (:...categoryIds)', { categoryIds: filter.categoryIds });
    }

    if (filter.maxPrice !== undefined) {
      builder.andWhere('product.price <= :maxPrice', { maxPrice: filter.maxPrice });
    }

    return builder
      .orderBy('product.popularityScore', 'DESC')
      .addOrderBy('product.rating', 'DESC')
      .take(filter.limit ?? 60)
      .getMany();
  }

  listCities(): Promise<CityStatRow[]> {
    return this.productsRepository
      .createQueryBuilder('product')
      .select('product.city', 'city')
      .addSelect('COUNT(*) OVER (PARTITION BY product.city)', 'count')
      .addSelect('product.imageUrl', 'imageUrl')
      .where('product.isActive = true')
      .distinctOn(['product.city'])
      .orderBy('product.city', 'ASC')
      .addOrderBy('product.popularityScore', 'DESC')
      .addOrderBy('product.rating', 'DESC')
      .getRawMany<CityStatRow>();
  }

  listCategoryBreakdown(): Promise<CategoryBreakdownRow[]> {
    return this.productsRepository
      .createQueryBuilder('product')
      .innerJoin('product.category', 'category')
      .select('category.id', 'categoryId')
      .addSelect('category.name', 'name')
      .addSelect('category.color', 'color')
      .addSelect('COUNT(*)', 'count')
      .where('product.isActive = true')
      .groupBy('category.id')
      .addGroupBy('category.name')
      .addGroupBy('category.color')
      .orderBy('count', 'DESC')
      .getRawMany<CategoryBreakdownRow>();
  }

  countAll(): Promise<number> {
    return this.productsRepository.count();
  }

  countActive(): Promise<number> {
    return this.productsRepository.countBy({ isActive: true });
  }

  countAiRecommendable(): Promise<number> {
    return this.productsRepository.countBy({ isActive: true, isAiRecommendable: true });
  }

  private applyFilters(builder: SelectQueryBuilder<Product>, query: QueryProductsDto): void {
    if (query.search) {
      builder.andWhere('(product.name ILIKE :search OR product.description ILIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    if (query.categoryId) {
      builder.andWhere('product.categoryId = :categoryId', { categoryId: query.categoryId });
    }

    if (query.city) {
      builder.andWhere('product.city ILIKE :city', { city: query.city });
    }

    if (query.tags?.length) {
      builder.andWhere('product.tags && :tags', { tags: query.tags });
    }

    if (query.minPrice !== undefined) {
      builder.andWhere('product.price >= :minPrice', { minPrice: query.minPrice });
    }

    if (query.maxPrice !== undefined) {
      builder.andWhere('product.price <= :maxPrice', { maxPrice: query.maxPrice });
    }

    if (query.isActive !== undefined) {
      builder.andWhere('product.isActive = :isActive', { isActive: query.isActive });
    }

    if (query.isAiRecommendable !== undefined) {
      builder.andWhere('product.isAiRecommendable = :isAiRecommendable', {
        isAiRecommendable: query.isAiRecommendable,
      });
    }

    if (query.latitude !== undefined && query.longitude !== undefined) {
      builder.andWhere(
        `(6371 * acos(
            least(1, greatest(-1,
              cos(radians(:latitude)) * cos(radians(product.latitude)) *
              cos(radians(product.longitude) - radians(:longitude)) +
              sin(radians(:latitude)) * sin(radians(product.latitude))
            ))
        )) <= :radiusKm`,
        {
          latitude: query.latitude,
          longitude: query.longitude,
          radiusKm: query.radiusKm ?? 10,
        },
      );
    }
  }
}
