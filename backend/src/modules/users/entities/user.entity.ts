import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { UserRole } from '../../../common/enums';
import { Route } from '../../routes/entities/route.entity';

export interface UserPreferences {
  homeCity?: string;
  interests?: string[];
  currency?: string;
  language?: string;
}

@Entity('users')
export class User extends BaseEntity {
  @ApiProperty()
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Exclude()
  @Column({ name: 'password_hash', type: 'varchar', length: 255, select: false })
  passwordHash: string;

  @ApiProperty()
  @Column({ name: 'full_name', type: 'varchar', length: 120 })
  fullName: string;

  @ApiProperty({ enum: UserRole })
  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @ApiProperty()
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @ApiPropertyOptional()
  @Column({ name: 'avatar_url', type: 'varchar', length: 500, nullable: true })
  avatarUrl: string | null;

  @ApiPropertyOptional()
  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  preferences: UserPreferences;

  @Exclude()
  @Column({ name: 'refresh_token_hash', type: 'varchar', length: 255, nullable: true, select: false })
  refreshTokenHash: string | null;

  @ApiPropertyOptional()
  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt: Date | null;

  @OneToMany(() => Route, (route) => route.user)
  routes: Route[];
}
