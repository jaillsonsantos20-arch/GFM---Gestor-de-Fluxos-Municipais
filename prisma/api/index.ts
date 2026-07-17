import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import type { Request, Response } from 'express';
import express from 'express';
import serverlessHttp from 'serverless-http';
import { AppModule } from '../src/app.module';

// Cacheado entre invocações "quentes" da função serverless — evita
// recriar o app Nest (e a conexão com o Prisma) em toda requisição.
let cachedHandler: ReturnType<typeof serverlessHttp> | null = null;

async function bootstrapServer() {
  const expressApp = express();
  const adapter = new ExpressAdapter(expressApp);

  const app = await NestFactory.create(AppModule, adapter, {
    logger: ['error', 'warn'],
  });

  app.enableCors({
    origin: process.env.FRONTEND_URL || true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.init();

  return serverlessHttp(expressApp);
}

export default async function handler(req: Request, res: Response) {
  if (!cachedHandler) {
    cachedHandler = await bootstrapServer();
  }
  return cachedHandler(req, res);
}
