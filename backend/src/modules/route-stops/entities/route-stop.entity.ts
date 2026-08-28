import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { StopType } from '../../../common/enums';
import { Product } from '../../products/entities/product.entity';
import { Route } from '../../routes/entities/route.entity';

const numericTransformer = {
  to: (value: number | null) => value,
  from: (value: string | null) => (value === null ? null : Number(value)),
};

@Entity('route_stops')
@Index(['routeId', 'dayNumber', 'orderIndex'])
export class RouteStop extends BaseEntity {
  @ApiProperty({ format: 'uuid' })
  @Column({ name: 'route_id', type: 'uuid' })
  routeId: string;

  @ManyToOne(() => Route, (route) => route.stops, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'route_id' })
  route: Route;

  @ApiProperty({ example: 1 })
  @Column({ name: 'day_number', type: 'int' })
  dayNumber: number;

  @ApiProperty({ example: 0 })
  @Column({ name: 'order_index', type: 'int' })
  orderIndex: number;

  @ApiProperty()
  @Column({ type: 'varchar', length: 200 })
  title: string;

  @ApiPropertyOptional()
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty({ enum: StopType })
  @Column({ type: 'enum', enum: StopType, default: StopType.AI_SUGGESTION })
  type: StopType;

  @ApiPropertyOptional({ format: 'uuid' })
  @Column({ name: 'product_id', type: 'uuid', nullable: true })
  productId: string | null;

  @ApiPropertyOptional({ type: () => Product })
  @ManyToOne(() => Product, { onDelete: 'SET NULL', nullable: true, eager: true })
  @JoinColumn({ name: 'product_id' })
  product: Product | null;

  @ApiPropertyOptional()
  @Column({ type: 'double precision', nullable: true })
  latitude: number | null;

  @ApiPropertyOptional()
  @Column({ type: 'double precision', nullable: true })
  longitude: number | null;

  @ApiPropertyOptional()
  @Column({ type: 'varchar', length: 300, nullable: true })
  address: string | null;

  @ApiPropertyOptional({ example: '10:30' })
  @Column({ name: 'start_time', type: 'varchar', length: 5, nullable: true })
  startTime: string | null;

  @ApiProperty({ example: 90 })
  @Column({ name: 'duration_minutes', type: 'int', default: 60 })
  durationMinutes: number;

  @ApiPropertyOptional()
  @Column({ name: 'estimated_cost', type: 'numeric', precision: 12, scale: 2, nullable: true, transformer: numericTransformer })
  estimatedCost: number | null;

  @ApiPropertyOptional({ description: 'Serbest metin kategori etiketi' })
  @Column({ name: 'category_label', type: 'varchar', length: 120, nullable: true })
  categoryLabel: string | null;

  @ApiProperty({ description: 'Kullanıcı bu durağı rotasına dahil etti mi' })
  @Column({ name: 'is_included', type: 'boolean', default: true })
  isIncluded: boolean;

  @ApiPropertyOptional({ description: 'Ürün eşleşme skoru (0-100)' })
  @Column({ name: 'match_score', type: 'numeric', precision: 5, scale: 2, nullable: true, transformer: numericTransformer })
  matchScore: number | null;

  @ApiPropertyOptional({ description: 'Ürünün rotaya neden eklendiği' })
  @Column({ name: 'match_reason', type: 'text', nullable: true })
  matchReason: string | null;

  @ApiPropertyOptional()
  @Column({ name: 'booking_url', type: 'varchar', length: 500, nullable: true })
  bookingUrl: string | null;
}
