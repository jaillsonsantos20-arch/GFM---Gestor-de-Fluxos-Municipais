import { NestFactory } from '@nestjs/core';
import { Module, Controller, Get } from '@nestjs/common';

@Controller()
class HealthController {
  @Get()
  health() {
    return { status: 'ok' };
  }
}

@Module({
  controllers: [HealthController],
})
class SimpleModule {}

async function bootstrap() {
  const app = await NestFactory.create(SimpleModule);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
