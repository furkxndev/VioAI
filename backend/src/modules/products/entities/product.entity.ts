import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { AttributeSource, VenueSetting } from '../../../common/enums';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Category } from '../../categories/entities/category.entity';

@Entity('products')
@Index(['city', 'isActive'])
@Index(['isAiRecommendable', 'isActive'])
export class Product extends BaseEntity {
  @ApiProperty()
  @Column({ type: 'varchar', length: 180 })
  name: string;

  @ApiProperty()
  @Column({ type: 'text' })
  description: string;

  @ApiProperty({ format: 'uuid' })
  @Column({ name: 'category_id', type: 'uuid' })
  categoryId: string;

  @ManyToOne(() => Category, (category) => category.products, {
    onDelete: 'RESTRICT',
    eager: true,
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ApiProperty({ example: 450 })
  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string | null) => (value === null ? 0 : Number(value)),
    },
  })
  price: number;

  @ApiProperty({ example: 'TRY' })
  @Column({ type: 'varchar', length: 3, default: 'TRY' })
  currency: string;

  @ApiProperty({ example: 'İstanbul' })
  @Column({ type: 'varchar', length: 120 })
  city: string;

  @ApiPropertyOptional({ example: 'Beyoğlu' })
  @Column({ type: 'varchar', length: 120, nullable: true })
  district: string | null;

  @ApiPropertyOptional()
  @Column({ type: 'varchar', length: 300, nullable: true })
  address: string | null;

  @ApiProperty({ example: 41.0256 })
  @Column({ type: 'double precision' })
  latitude: number;

  @ApiProperty({ example: 28.9744 })
  @Column({ type: 'double precision' })
  longitude: number;

  @ApiProperty({ description: 'Aktivite süresi (dakika)', example: 120 })
  @Column({ name: 'duration_minutes', type: 'int', default: 60 })
  durationMinutes: number;

  @ApiProperty({ type: [String] })
  @Column({ type: 'text', array: true, default: () => "'{}'::text[]" })
  tags: string[];

  @ApiPropertyOptional()
  @Column({ name: 'image_url', type: 'varchar', length: 500, nullable: true })
  imageUrl: string | null;

  @ApiPropertyOptional()
  @Column({ name: 'booking_url', type: 'varchar', length: 500, nullable: true })
  bookingUrl: string | null;

  @ApiProperty()
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({ description: 'AI tarafından rotalara önerilebilir mi' })
  @Column({ name: 'is_ai_recommendable', type: 'boolean', default: true })
  isAiRecommendable: boolean;

  @ApiProperty({ example: 4.7 })
  @Column({
    type: 'numeric',
    precision: 3,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string | null) => (value === null ? 0 : Number(value)),
    },
  })
  rating: number;

  @ApiProperty()
  @Column({ name: 'review_count', type: 'int', default: 0 })
  reviewCount: number;

  @ApiProperty({ description: 'Sıralama için popülerlik puanı (0-100)' })
  @Column({ name: 'popularity_score', type: 'int', default: 0 })
  popularityScore: number;

  @ApiPropertyOptional({
    enum: VenueSetting,
    description: 'Kapalı/açık alan. Yağmurlu gün sorgularında filtrelenir.',
  })
  @Column({ name: 'venue_setting', type: 'enum', enum: VenueSetting, nullable: true })
  venueSetting: VenueSetting | null;

  @ApiPropertyOptional({
    description: 'Katılım için en düşük yaş. Null ise sınır belirlenememiştir.',
    example: 10,
  })
  @Column({ name: 'min_age', type: 'int', nullable: true })
  minAge: number | null;

  @ApiPropertyOptional({
    enum: AttributeSource,
    description: 'venueSetting ve minAge bilgisinin kaynağı; unknown ise yaşa duyarlı sorgularda elenir.',
  })
  @Column({
    name: 'attribute_source',
    type: 'enum',
    enum: AttributeSource,
    default: AttributeSource.UNKNOWN,
  })
  attributeSource: AttributeSource;

  @ApiPropertyOptional({ description: 'Sınıflandırmanın dayandığı açıklama parçası' })
  @Column({ name: 'attribute_evidence', type: 'varchar', length: 400, nullable: true })
  attributeEvidence: string | null;

  /**
   * Anlamsal eşleştirme için gömme vektörü. `bun run embed` ile üretilir.
   * Null ise ürün kelime örtüşmesiyle skorlanır — sistem yine çalışır.
   * API yanıtlarında gizlidir; 384 sayılık dizinin istemciye gitmesi anlamsız.
   */
  @ApiHideProperty()
  @Exclude()
  @Column({ type: 'real', array: true, nullable: true, select: false })
  embedding: number[] | null;

  @ApiHideProperty()
  @Exclude()
  @Column({
    name: 'embedding_model',
    type: 'varchar',
    length: 120,
    nullable: true,
    select: false,
  })
  embeddingModel: string | null;
}
