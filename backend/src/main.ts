import { Logger, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import type { AppConfig } from './config/configuration';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const configService = app.get(ConfigService);
  const appConfig = configService.getOrThrow<AppConfig>('app');

  app.use(helmet());
  app.enableCors({
    origin: appConfig.corsOrigins,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  });

  app.setGlobalPrefix(appConfig.apiPrefix);
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.enableShutdownHooks();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('VioAI API')
    .setDescription('Viofun için AI destekli kişiselleştirilmiş rota ve aktivite öneri API’si')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'api-key')
    .build();

  SwaggerModule.setup(
    `${appConfig.apiPrefix}/docs`,
    app,
    SwaggerModule.createDocument(app, swaggerConfig),
    { swaggerOptions: { persistAuthorization: true } },
  );

  await app.listen(appConfig.port, '0.0.0.0');

  new Logger('Bootstrap').log(
    `VioAI API http://localhost:${appConfig.port}/${appConfig.apiPrefix} adresinde çalışıyor`,
  );
}

void bootstrap();
