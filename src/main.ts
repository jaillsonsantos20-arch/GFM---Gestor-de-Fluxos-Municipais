import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();

  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const prisma = new PrismaClient();
  const usuarioCount = await prisma.usuario.count();
  if (usuarioCount === 0) {
    console.log('Nenhum usuário encontrado. Criando administrador padrão...');
    await prisma.usuario.create({
      data: {
        nome: 'Administrador Geral',
        email: 'admin@gfm.com',
        senha: await bcrypt.hash('admin123', 10),
        role: Role.GESTOR,
      },
    });
    console.log('Administrador criado: admin@gfm.com / admin123');
  }
  await prisma.$disconnect();

  await app.listen(3000);
}
bootstrap();
