import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto';
import { UserRole } from '../../../common/enums';

export class QueryUsersDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'İsim veya e-posta içinde arama' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @ApiPropertyOptional({ enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value === 'true' : Boolean(value)))
  @IsBoolean()
  isActive?: boolean;
}
