import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

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
    console.log('Admin criado: admin@gfm.com / admin123');
  }

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Server running on port ${port}`);
}

bootstrap();
