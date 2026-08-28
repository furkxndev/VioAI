import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ApiKeyScope } from '../../../common/enums';
import { User } from '../../users/entities/user.entity';

@Entity('api_keys')
export class ApiKey extends BaseEntity {
  @ApiProperty()
  @Column({ type: 'varchar', length: 120 })
  name: string;

  @ApiPropertyOptional()
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty({ description: 'Anahtarın herkese açık ön eki' })
  @Index({ unique: true })
  @Column({ name: 'key_prefix', type: 'varchar', length: 32 })
  keyPrefix: string;

  @Exclude()
  @Column({ name: 'key_hash', type: 'varchar', length: 255, select: false })
  keyHash: string;

  @ApiProperty({ enum: ApiKeyScope, isArray: true })
  @Column({ type: 'text', array: true, default: () => "'{}'::text[]" })
  scopes: ApiKeyScope[];

  @ApiProperty()
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @ApiPropertyOptional()
  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt: Date | null;

  @ApiPropertyOptional()
  @Column({ name: 'last_used_at', type: 'timestamptz', nullable: true })
  lastUsedAt: Date | null;

  @ApiPropertyOptional()
  @Column({ name: 'created_by_id', type: 'uuid', nullable: true })
  createdById: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User | null;
}
