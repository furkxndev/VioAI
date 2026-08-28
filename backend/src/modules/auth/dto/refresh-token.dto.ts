import { ApiProperty } from '@nestjs/swagger';
import { IsJWT } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty()
  @IsJWT({ message: 'Geçersiz yenileme anahtarı' })
  refreshToken: string;
}
