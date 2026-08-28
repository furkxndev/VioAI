import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsInt, IsUUID, Min, ValidateNested } from 'class-validator';

export class ReorderStopItemDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  id: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  dayNumber: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  orderIndex: number;
}

export class ReorderStopsDto {
  @ApiProperty({ type: [ReorderStopItemDto] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ReorderStopItemDto)
  stops: ReorderStopItemDto[];
}
