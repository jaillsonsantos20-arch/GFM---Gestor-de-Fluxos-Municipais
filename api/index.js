const serverless = require('serverless-http');
const { NestFactory } = require('@nestjs/core');
const { ValidationPipe } = require('@nestjs/common');
const { NestExpressApplication } = require('@nestjs/platform-express');
const { join } = require('path');
const { existsSync, mkdirSync } = require('fs');
const { AppModule } = require('../dist/src/app.module');
const { PrismaService } = require('../dist/src/prisma/prisma.service');
const { Role } = require('@prisma/client');
const bcrypt = require('bcrypt');

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

exports.handler = serverless(async (req, res) => {
  if (!cachedHandler) {
    cachedHandler = await bootstrap();
  }
  cachedHandler(req, res);
});
