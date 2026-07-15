import { Module } from '@nestjs/common';
import { SecretariasController } from './secretarias.controller';
import { SecretariasService } from './secretarias.service';

@Module({
  controllers: [SecretariasController],
  providers: [SecretariasService],
  exports: [SecretariasService],
})
export class SecretariasModule {}
