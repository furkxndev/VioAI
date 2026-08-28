import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'gezgin@viofun.com' })
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz' })
  @MaxLength(255)
  email: string;

  @ApiProperty()
  @IsString()
  password: string;
}
