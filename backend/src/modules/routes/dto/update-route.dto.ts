import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Length, MaxLength } from 'class-validator';
import { RouteStatus } from '../../../common/enums';

export class UpdateRouteDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(3, 200)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  summary?: string;

  @ApiPropertyOptional({ enum: RouteStatus })
  @IsOptional()
  @IsEnum(RouteStatus)
  status?: RouteStatus;
}
