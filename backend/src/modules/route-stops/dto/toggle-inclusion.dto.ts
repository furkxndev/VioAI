import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class ToggleInclusionDto {
  @ApiProperty({ description: 'Durak rotaya dahil edilsin mi' })
  @IsBoolean()
  isIncluded: boolean;
}
