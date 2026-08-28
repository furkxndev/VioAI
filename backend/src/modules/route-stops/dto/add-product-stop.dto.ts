import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsUUID, Matches, Min } from 'class-validator';

export class AddProductStopDto {
  @ApiProperty({ format: 'uuid', description: 'Rotaya eklenecek Viofun ürünü' })
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  dayNumber: number;

  @ApiPropertyOptional({ description: 'Boş bırakılırsa günün sonuna eklenir' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  orderIndex?: number;

  @ApiPropertyOptional({ example: '15:00' })
  @IsOptional()
  @Matches(/^\d{2}:\d{2}$/, { message: 'Saat HH:mm biçiminde olmalıdır' })
  startTime?: string;
}
