import serverless from 'serverless-http';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

let cachedHandler;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  const uploadsDir = join(process.cwd(), 'uploads');
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
  }
  app.useStaticAssets(uploadsDir, { prefix: '/uploads' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  try {
    const prisma = app.get(PrismaService);
    const userCount = await prisma.usuario.count();
    if (userCount === 0) {
      const senhaHash = await bcrypt.hash('admin123', 10);
      await prisma.usuario.create({
        data: {
          nome: 'Administrador Geral',
          email: 'admin@gfm.com',
          senha: senhaHash,
          role: Role.GESTOR,
        },
      });
    }
  } catch (e) {
    console.error('Seed admin error:', e.message);
  }

  await app.init();
  return app.getHttpAdapter().getInstance();
}

export const handler = serverless(async (req, res) => {
  if (!cachedHandler) {
    cachedHandler = await bootstrap();
  }
  cachedHandler(req, res);
});
