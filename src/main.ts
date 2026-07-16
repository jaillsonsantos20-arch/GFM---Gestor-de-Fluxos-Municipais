import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  console.log('Iniciando NestJS...');
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    console.log('App created');

    app.enableCors();

    try {
      const uploadsDir = join(process.cwd(), 'uploads');
      if (!existsSync(uploadsDir)) {
        mkdirSync(uploadsDir, { recursive: true });
      }
      app.useStaticAssets(uploadsDir, { prefix: '/uploads' });
    } catch (e) {
      console.log('Uploads dir error:', e.message);
    }

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
      console.log('User count:', userCount);
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
    } catch (e) {
      console.log('Prisma error:', e.message);
    }

    const port = process.env.PORT || 3000;
    await app.listen(port, '0.0.0.0');
    console.log(`Server running on port ${port}`);
  } catch (e) {
    console.log('Bootstrap error:', e.message, e.stack);
  }
}

bootstrap();
