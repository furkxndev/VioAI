import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import type { DatabaseConfig } from '../config/configuration';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const database = configService.getOrThrow<DatabaseConfig>('database');

        return {
          type: 'postgres' as const,
          host: database.host,
          port: database.port,
          username: database.username,
          password: database.password,
          database: database.name,
          ssl: database.ssl ? { rejectUnauthorized: false } : false,
          autoLoadEntities: true,
          synchronize: database.synchronize,
          logging: database.logging,
          migrationsRun: false,
          retryAttempts: 10,
          retryDelay: 3000,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
