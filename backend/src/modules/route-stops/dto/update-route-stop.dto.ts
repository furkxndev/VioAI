import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateRouteStopDto } from './create-route-stop.dto';

export class UpdateRouteStopDto extends PartialType(CreateRouteStopDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isIncluded?: boolean;
}
