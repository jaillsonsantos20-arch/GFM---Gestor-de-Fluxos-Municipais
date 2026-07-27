import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_URL || true,
    credentials: true,
  });

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

  // Diagnostic endpoint
  app.getHttpAdapter().get('/health/diagnostic', async (req: Request, res: Response) => {
    const results: any = {};

    // Test Prisma
    try {
      const prisma = app.get(PrismaService);
      const userCount = await prisma.usuario.count();
      results.prisma = { ok: true, userCount };
    } catch (e) {
      results.prisma = { ok: false, error: e.message, stack: e.stack?.split('\n').slice(0, 5) };
    }

    // Test bcrypt
    try {
      const hash = await bcrypt.hash('test', 10);
      results.bcrypt = { ok: true, hashLength: hash.length };
    } catch (e) {
      results.bcrypt = { ok: false, error: e.message };
    }

    res.json(results);
  });

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

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Server running on port ${port}`);
}

bootstrap().catch(e => {
  console.error('Bootstrap fatal:', e.message, e.stack);
  process.exit(1);
});
