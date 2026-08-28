import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { slugify } from '../../common/utils';
import { CreateCategoryDto, QueryCategoriesDto, UpdateCategoryDto } from './dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async create(dto: CreateCategoryDto): Promise<Category> {
    const slug = slugify(dto.slug ?? dto.name);

    if (await this.categoriesRepository.existsBy({ slug })) {
      throw new ConflictException('Bu kategori kısa adı zaten kullanılıyor');
    }

    return this.categoriesRepository.save(
      this.categoriesRepository.create({
        name: dto.name,
        slug,
        description: dto.description ?? null,
        icon: dto.icon ?? null,
        color: dto.color ?? null,
        isActive: dto.isActive ?? true,
        sortOrder: dto.sortOrder ?? 0,
      }),
    );
  }

  findAll(query: QueryCategoriesDto = {}): Promise<Category[]> {
    return this.categoriesRepository.find({
      where: query.isActive === undefined ? {} : { isActive: query.isActive },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findById(id: string): Promise<Category> {
    const category = await this.categoriesRepository.findOneBy({ id });

    if (!category) {
      throw new NotFoundException('Kategori bulunamadı');
    }

    return category;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findById(id);

    if (dto.slug || dto.name) {
      const slug = slugify(dto.slug ?? dto.name ?? category.name);
      if (slug !== category.slug && (await this.categoriesRepository.existsBy({ slug }))) {
        throw new ConflictException('Bu kategori kısa adı zaten kullanılıyor');
      }
      category.slug = slug;
    }

    if (dto.name !== undefined) category.name = dto.name;
    if (dto.description !== undefined) category.description = dto.description;
    if (dto.icon !== undefined) category.icon = dto.icon;
    if (dto.color !== undefined) category.color = dto.color;
    if (dto.isActive !== undefined) category.isActive = dto.isActive;
    if (dto.sortOrder !== undefined) category.sortOrder = dto.sortOrder;

    return this.categoriesRepository.save(category);
  }

  async remove(id: string): Promise<void> {
    const result = await this.categoriesRepository.delete(id);

    if (!result.affected) {
      throw new NotFoundException('Kategori bulunamadı');
    }
  }

  countAll(): Promise<number> {
    return this.categoriesRepository.count();
  }
}
