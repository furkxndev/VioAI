import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { API_KEY_SCOPES_KEY } from '../decorators/api-key-scopes.decorator';
import type { ApiKeyScope } from '../enums';
import type { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

@Injectable()
export class ApiKeyScopesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.apiKey) {
      return true;
    }

    const requiredScopes = this.reflector.getAllAndOverride<ApiKeyScope[] | undefined>(
      API_KEY_SCOPES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredScopes || requiredScopes.length === 0) {
      throw new ForbiddenException('Bu endpoint API key ile kullanılamaz');
    }

    const granted = new Set(request.apiKey.scopes);
    const missing = requiredScopes.filter((scope) => !granted.has(scope));

    if (missing.length > 0) {
      throw new ForbiddenException(`API key için eksik yetki: ${missing.join(', ')}`);
    }

    return true;
  }
}
