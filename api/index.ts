import serverless from 'serverless-http';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { Role } from '../src/auth/enums/role.enum';
import * as bcrypt from 'bcrypt';

let cachedHandler;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

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

  await app.init();
  return app.getHttpAdapter().getInstance();
}

export const handler = serverless(async (req, res) => {
  if (!cachedHandler) {
    cachedHandler = await bootstrap();
  }
  cachedHandler(req, res);
});
