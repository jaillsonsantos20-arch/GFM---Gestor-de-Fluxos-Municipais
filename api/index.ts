import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import * as express from 'express';
import { join } from 'path';
import { existsSync, readdirSync } from 'fs';
import { AppModule } from '../src/app.module';

let cachedApp: any;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_URL || true,
    credentials: true,
  });

  const frontendDir = join(process.cwd(), 'frontend', 'dist');
  if (existsSync(frontendDir)) {
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.use(express.static(frontendDir));
  }

  app.getHttpAdapter().get('/api/__debug', (req: Request, res: Response) => {
    const cwd = process.cwd();
    const frontendDir2 = join(cwd, 'frontend', 'dist');
    const result: any = { cwd, frontendDir: frontendDir2, exists: existsSync(frontendDir2) };
    if (result.exists) {
      try { result.files = readdirSync(frontendDir2); } catch (e) { result.readdirError = e.message; }
      try {
        const assetsDir = join(frontendDir2, 'assets');
        result.assetsExists = existsSync(assetsDir);
        if (result.assetsExists) result.assetsFiles = readdirSync(assetsDir);
      } catch (e) { result.assetsError = e.message; }
    }
    res.json(result);
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.get('*', (req: Request, res: Response) => {
    if (!req.path.startsWith('/api')) {
      const indexPath = join(frontendDir, 'index.html');
      if (existsSync(indexPath)) {
        res.sendFile(indexPath);
      }
    }
  });
  return expressApp;
}

async function handler(req: Request, res: Response) {
  if (!cachedApp) {
    cachedApp = await bootstrap();
  }
  return new Promise<void>((resolve, reject) => {
    res.on('finish', resolve);
    res.on('error', reject);
    cachedApp(req, res);
  });
}

export = handler;
