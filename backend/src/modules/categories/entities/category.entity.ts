import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('categories')
export class Category extends BaseEntity {
  @ApiProperty()
  @Column({ type: 'varchar', length: 120 })
  name: string;

  @ApiProperty()
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 140 })
  slug: string;

  @ApiPropertyOptional()
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiPropertyOptional({ description: 'Lucide ikon adı' })
  @Column({ type: 'varchar', length: 60, nullable: true })
  icon: string | null;

  @ApiPropertyOptional({ description: 'Hex renk kodu' })
  @Column({ type: 'varchar', length: 9, nullable: true })
  color: string | null;

  @ApiProperty()
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty()
  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
