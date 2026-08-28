import { ApiProperty } from '@nestjs/swagger';

export class AiStatusDto {
  @ApiProperty()
  configured: boolean;

  @ApiProperty()
  model: string;

  @ApiProperty()
  provider: string;

  @ApiProperty({
    description: 'Anlamsal eşleştirmede kullanılan yerel gömme modeli',
  })
  embeddingModel: string;

  @ApiProperty({
    description:
      'Anlamsal eşleştirme açık mı; false ise kelime örtüşmesi kullanılır',
  })
  semanticMatching: boolean;

  @ApiProperty({
    description: 'Gömme modeli belleğe yüklendi mi (ilk istekte yüklenir)',
  })
  embeddingLoaded: boolean;
}
