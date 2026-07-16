import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('Starting NestJS...');
  try {
    const app = await NestFactory.create(AppModule);
    console.log('App created successfully');
    await app.listen(process.env.PORT || 3000);
    console.log('Server started');
  } catch (e) {
    console.error('FATAL:', e.message, e.stack);
    throw e;
  }
}

bootstrap();
