exports.handler = async (req, res) => {
  const results = {};
  
  try {
    results.nodeVersion = process.version;
    results.envVars = Object.keys(process.env).filter(k => !k.includes('TOKEN') && !k.includes('SECRET') && !k.includes('KEY'));
    results.cwd = process.cwd();
    
    // Try importing modules
    const modules = [
      '@nestjs/core',
      '@nestjs/common',
      '@nestjs/platform-express',
      '@prisma/client',
      'bcryptjs',
      'class-transformer',
      'class-validator',
      'passport',
      'passport-jwt',
      '@nestjs/jwt',
      '@nestjs/passport',
      'serverless-http',
      'reflect-metadata',
      'rxjs',
    ];
    
    results.imports = {};
    for (const m of modules) {
      try {
        require(m);
        results.imports[m] = 'ok';
      } catch (e) {
        results.imports[m] = e.message;
      }
    }
    
    // Try our app module
    try {
      const { AppModule } = require('../dist/src/app.module');
      results.appModule = 'ok';
    } catch (e) {
      results.appModule = e.message;
    }
    
    // Try Prisma connect
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      const result = await prisma.$queryRaw`SELECT 1 as ok`;
      results.prismaConnect = 'ok: ' + JSON.stringify(result);
      await prisma.$disconnect();
    } catch (e) {
      results.prismaConnect = e.message;
    }
  } catch (e) {
    results.globalError = e.message;
  }
  
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(results, null, 2));
};
