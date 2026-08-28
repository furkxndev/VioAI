import type { SignOptions } from 'jsonwebtoken';

export interface AppConfig {
  env: string;
  port: number;
  apiPrefix: string;
  corsOrigins: string[];
}

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  name: string;
  synchronize: boolean;
  logging: boolean;
  ssl: boolean;
}

export type JwtExpiresIn = SignOptions['expiresIn'];

export interface JwtConfig {
  accessSecret: string;
  accessExpiresIn: JwtExpiresIn;
  refreshSecret: string;
  refreshExpiresIn: JwtExpiresIn;
}

export interface OpenRouterConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  timeoutMs: number;
  referer: string;
  title: string;
}

export interface EmbeddingConfig {
  enabled: boolean;
  model: string;
  dimensions: number;
  maxDescriptionChars: number;
  cacheDir: string | undefined;
}

export interface Configuration {
  app: AppConfig;
  database: DatabaseConfig;
  jwt: JwtConfig;
  openRouter: OpenRouterConfig;
  embedding: EmbeddingConfig;
}

const toNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && value !== undefined && value !== ''
    ? parsed
    : fallback;
};

const toBoolean = (value: string | undefined, fallback = false): boolean =>
  value === undefined ? fallback : value.toLowerCase() === 'true';

export const configuration = (): Configuration => ({
  app: {
    env: process.env.NODE_ENV ?? 'development',
    port: toNumber(process.env.PORT, 3000),
    apiPrefix: process.env.API_PREFIX ?? 'api',
    corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  },
  database: {
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: toNumber(process.env.DATABASE_PORT, 5432),
    username: process.env.DATABASE_USER ?? 'vioai',
    password: process.env.DATABASE_PASSWORD ?? 'vioai',
    name: process.env.DATABASE_NAME ?? 'vioai',
    synchronize: toBoolean(process.env.DATABASE_SYNCHRONIZE, false),
    logging: toBoolean(process.env.DATABASE_LOGGING, false),
    ssl: toBoolean(process.env.DATABASE_SSL, false),
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? '',
    accessExpiresIn: (process.env.JWT_ACCESS_EXPIRES_IN ??
      '15m') as JwtExpiresIn,
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? '',
    refreshExpiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ??
      '7d') as JwtExpiresIn,
  },
  openRouter: {
    apiKey: process.env.OPENROUTER_API_KEY ?? '',
    baseUrl: process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1',
    model: process.env.OPENROUTER_MODEL ?? 'anthropic/claude-sonnet-4.5',
    timeoutMs: toNumber(process.env.OPENROUTER_TIMEOUT_MS, 90_000),
    referer: process.env.OPENROUTER_REFERER ?? 'https://vioai.viofun.com',
    title: process.env.OPENROUTER_TITLE ?? 'VioAI',
  },
  embedding: {
    enabled: toBoolean(process.env.EMBEDDING_ENABLED, true),
    model:
      process.env.EMBEDDING_MODEL ??
      'Xenova/paraphrase-multilingual-MiniLM-L12-v2',
    dimensions: toNumber(process.env.EMBEDDING_DIMENSIONS, 384),
    maxDescriptionChars: toNumber(
      process.env.EMBEDDING_MAX_DESCRIPTION_CHARS,
      450,
    ),
    cacheDir: process.env.EMBEDDING_CACHE_DIR || undefined,
  },
});
