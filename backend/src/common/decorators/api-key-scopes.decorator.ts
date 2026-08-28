import { SetMetadata } from '@nestjs/common';
import { ApiKeyScope } from '../enums';

export const API_KEY_SCOPES_KEY = 'auth:apiKeyScopes';

export const RequireScopes = (...scopes: ApiKeyScope[]) => SetMetadata(API_KEY_SCOPES_KEY, scopes);
