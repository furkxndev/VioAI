import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../common/enums';

export class AuthUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty({ nullable: true })
  avatarUrl: string | null;
}

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty({ type: AuthUserDto })
  user: AuthUserDto;
}
