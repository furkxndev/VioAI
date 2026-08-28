import type { Request } from 'express';
import type { UserRole } from '../enums';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface ApiKeyPrincipal {
  id: string;
  name: string;
  scopes: string[];
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  apiKey?: ApiKeyPrincipal;
}
