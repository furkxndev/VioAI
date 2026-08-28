import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { RouteStatus, TransportMode, TravelPace } from '../../../common/enums';
import { RouteStop } from '../../route-stops/entities/route-stop.entity';
import { User } from '../../users/entities/user.entity';

const numericTransformer = {
  to: (value: number | null) => value,
  from: (value: string | null) => (value === null ? null : Number(value)),
};

@Entity('routes')
@Index(['userId', 'createdAt'])
export class Route extends BaseEntity {
  @ApiPropertyOptional({ format: 'uuid' })
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;

  @ManyToOne(() => User, (user) => user.routes, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @ApiProperty({ example: '3 Günde İstanbul: Tarih ve Manzara' })
  @Column({ type: 'varchar', length: 200 })
  title: string;

  @ApiPropertyOptional()
  @Column({ type: 'text', nullable: true })
  summary: string | null;

  @ApiProperty({ example: 'İstanbul' })
  @Column({ type: 'varchar', length: 120 })
  city: string;

  @ApiPropertyOptional()
  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: string | null;

  @ApiProperty({ example: 3 })
  @Column({ type: 'int' })
  days: number;

  @ApiProperty({ example: 8000 })
  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0, transformer: numericTransformer })
  budget: number;

  @ApiProperty({ example: 'TRY' })
  @Column({ type: 'varchar', length: 3, default: 'TRY' })
  currency: string;

  @ApiProperty({ example: 2 })
  @Column({ type: 'int', default: 1 })
  travelers: number;

  @ApiProperty({ type: [String] })
  @Column({ type: 'text', array: true, default: () => "'{}'::text[]" })
  interests: string[];

  @ApiProperty({ enum: TransportMode })
  @Column({ name: 'transport_mode', type: 'enum', enum: TransportMode, default: TransportMode.MIXED })
  transportMode: TransportMode;

  @ApiProperty({ enum: TravelPace })
  @Column({ type: 'enum', enum: TravelPace, default: TravelPace.BALANCED })
  pace: TravelPace;

  @ApiProperty({ enum: RouteStatus })
  @Column({ type: 'enum', enum: RouteStatus, default: RouteStatus.READY })
  status: RouteStatus;

  @ApiPropertyOptional({ description: 'AI tahmini toplam maliyet' })
  @Column({ name: 'estimated_cost', type: 'numeric', precision: 12, scale: 2, nullable: true, transformer: numericTransformer })
  estimatedCost: number | null;

  @ApiPropertyOptional()
  @Column({ name: 'center_latitude', type: 'double precision', nullable: true })
  centerLatitude: number | null;

  @ApiPropertyOptional()
  @Column({ name: 'center_longitude', type: 'double precision', nullable: true })
  centerLongitude: number | null;

  @ApiPropertyOptional()
  @Column({ name: 'ai_model', type: 'varchar', length: 120, nullable: true })
  aiModel: string | null;

  @ApiPropertyOptional({ description: 'Üretim süresi (ms)' })
  @Column({ name: 'generation_ms', type: 'int', nullable: true })
  generationMs: number | null;

  @ApiProperty({ type: () => RouteStop, isArray: true })
  @OneToMany(() => RouteStop, (stop) => stop.route, { cascade: ['insert'] })
  stops: RouteStop[];
}
