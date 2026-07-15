import { Module } from '@nestjs/common';
import { ProcessosController } from './processos.controller';
import { UploadsController } from './uploads.controller';
import { ProcessosService } from './processos.service';

@Module({
  controllers: [ProcessosController, UploadsController],
  providers: [ProcessosService],
})
export class ProcessosModule {}
