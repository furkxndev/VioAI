import { ApiProperty } from '@nestjs/swagger';

export class AiStatusDto {
  @ApiProperty()
  configured: boolean;

  @ApiProperty()
  model: string;

  @ApiProperty()
  provider: string;
}
