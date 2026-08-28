import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ApiKeysService } from '../../modules/api-keys/api-keys.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import type { UserRole } from '../enums';
import type { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export const API_KEY_HEADER = 'x-api-key';

@Injectable()
export class JwtOrApiKeyGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly apiKeysService: ApiKeysService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean | undefined>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const apiKeyHeader = request.headers[API_KEY_HEADER];

    if (typeof apiKeyHeader === 'string' && apiKeyHeader.length > 0) {
      const apiKey = await this.apiKeysService.authenticate(apiKeyHeader);
      request.apiKey = { id: apiKey.id, name: apiKey.name, scopes: apiKey.scopes };
      return true;
    }

    const token = this.extractBearerToken(request);

    if (!token) {
      if (isPublic) {
        return true;
      }
      throw new UnauthorizedException('Kimlik doğrulama bilgisi bulunamadı');
    }

    try {
      const payload = await this.jwtService.verifyAsync<AccessTokenPayload>(token, {
        secret: this.configService.getOrThrow<string>('jwt.accessSecret'),
      });
      request.user = { id: payload.sub, email: payload.email, role: payload.role };
      return true;
    } catch {
      if (isPublic) {
        return true;
      }
      throw new UnauthorizedException('Geçersiz veya süresi dolmuş oturum');
    }
  }

  private extractBearerToken(request: AuthenticatedRequest): string | null {
    const [scheme, value] = request.headers.authorization?.split(' ') ?? [];
    return scheme?.toLowerCase() === 'bearer' && value ? value : null;
  }
}
