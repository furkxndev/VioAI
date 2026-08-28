import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto';
import { RouteStatus } from '../../../common/enums';

export class QueryRoutesDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string;

  @ApiPropertyOptional({ enum: RouteStatus })
  @IsOptional()
  @IsEnum(RouteStatus)
  status?: RouteStatus;
}
