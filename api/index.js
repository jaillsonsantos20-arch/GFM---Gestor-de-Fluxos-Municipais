let app;

exports.handler = async (req, res) => {
  try {
    if (!app) {
      const { NestFactory } = require('@nestjs/core');
      const { ValidationPipe } = require('@nestjs/common');
      const { join } = require('path');
      const { existsSync, mkdirSync } = require('fs');
      const { AppModule } = require('../dist/src/app.module');
      const { PrismaService } = require('../dist/src/prisma/prisma.service');
      const bcrypt = require('bcrypt');
      const { Role } = require('@prisma/client');

      const nestApp = await NestFactory.create(AppModule);
      nestApp.enableCors();

      const uploadsDir = join(process.cwd(), 'uploads');
      if (!existsSync(uploadsDir)) {
        mkdirSync(uploadsDir, { recursive: true });
      }
      nestApp.useStaticAssets(uploadsDir, { prefix: '/uploads' });

      nestApp.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

      try {
        const prisma = nestApp.get(PrismaService);
        const userCount = await prisma.usuario.count();
        if (userCount === 0) {
          const senhaHash = await bcrypt.hash('admin123', 10);
          await prisma.usuario.create({
            data: { nome: 'Administrador Geral', email: 'admin@gfm.com', senha: senhaHash, role: Role.GESTOR },
          });
        }
      } catch (e) {
        console.error('Seed error:', e.message);
      }

      await nestApp.init();
      app = nestApp.getHttpAdapter().getInstance();
    }
    app(req, res);
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: e.message, stack: e.stack?.split('\n').slice(0, 5) }));
  }
};
