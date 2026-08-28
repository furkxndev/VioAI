import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { JwtConfig } from '../../config/configuration';
import type { UserRole } from '../../common/enums';
import type { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthResponseDto, LoginDto, RegisterDto } from './dto';

interface TokenPayload {
  sub: string;
  email: string;
  role: UserRole;
}

const REFRESH_TOKEN_SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const user = await this.usersService.create(dto);
    return this.issueTokens(user);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmailWithSecrets(dto.email);

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('E-posta veya şifre hatalı');
    }

    if (!user.isActive) {
      throw new ForbiddenException('Hesabınız devre dışı bırakılmış');
    }

    await this.usersService.markLoggedIn(user.id);

    return this.issueTokens(user);
  }

  async refresh(refreshToken: string): Promise<AuthResponseDto> {
    const jwtConfig = this.configService.getOrThrow<JwtConfig>('jwt');

    let payload: TokenPayload;
    try {
      payload = await this.jwtService.verifyAsync<TokenPayload>(refreshToken, {
        secret: jwtConfig.refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Yenileme anahtarı geçersiz veya süresi dolmuş');
    }

    const user = await this.usersService.findByIdWithSecrets(payload.sub);

    if (!user?.refreshTokenHash || !user.isActive) {
      throw new UnauthorizedException('Oturum bulunamadı');
    }

    if (!(await bcrypt.compare(refreshToken, user.refreshTokenHash))) {
      await this.usersService.setRefreshTokenHash(user.id, null);
      throw new UnauthorizedException('Yenileme anahtarı geçersiz');
    }

    return this.issueTokens(user);
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.setRefreshTokenHash(userId, null);
  }

  private async issueTokens(user: User): Promise<AuthResponseDto> {
    const jwtConfig = this.configService.getOrThrow<JwtConfig>('jwt');
    const payload: TokenPayload = { sub: user.id, email: user.email, role: user.role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: jwtConfig.accessSecret,
        expiresIn: jwtConfig.accessExpiresIn,
      }),
      this.jwtService.signAsync(payload, {
        secret: jwtConfig.refreshSecret,
        expiresIn: jwtConfig.refreshExpiresIn,
      }),
    ]);

    await this.usersService.setRefreshTokenHash(
      user.id,
      await bcrypt.hash(refreshToken, REFRESH_TOKEN_SALT_ROUNDS),
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    };
  }
}
