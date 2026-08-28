import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, Length, MaxLength } from 'class-validator';
import { UserRole } from '../../../common/enums';

export class CreateUserDto {
  @ApiProperty({ example: 'gezgin@viofun.com' })
  @IsEmail({}, { message: 'Geçerli bir e-posta adresi giriniz' })
  @MaxLength(255)
  email: string;

  @ApiProperty({ minLength: 8, maxLength: 72 })
  @IsString()
  @Length(8, 72, { message: 'Şifre 8-72 karakter arasında olmalıdır' })
  password: string;

  @ApiProperty({ example: 'Ada Yılmaz' })
  @IsString()
  @Length(2, 120)
  fullName: string;

  @ApiPropertyOptional({ enum: UserRole, default: UserRole.USER })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
