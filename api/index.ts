import serverlessHttp from 'serverless-http';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../dist/src/app.module';

let cachedHandler: ReturnType<typeof serverlessHttp>;

export const handler = async (event: any, context: any) => {
  if (!cachedHandler) {
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    cachedHandler = serverlessHttp(app.getHttpAdapter().getInstance());
  }
  return cachedHandler(event, context);
};
