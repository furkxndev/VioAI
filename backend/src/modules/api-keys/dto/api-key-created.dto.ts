import { ApiProperty } from '@nestjs/swagger';
import { ApiKey } from '../entities/api-key.entity';

export class ApiKeyCreatedDto {
  @ApiProperty({ type: ApiKey })
  apiKey: ApiKey;

  @ApiProperty({ description: 'Yalnızca bir kez gösterilir, saklayınız' })
  plainKey: string;
}
