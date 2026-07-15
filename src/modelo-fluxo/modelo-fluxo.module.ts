import { Module } from '@nestjs/common';
import { ModeloFluxoController } from './modelo-fluxo.controller';
import { ModeloFluxoService } from './modelo-fluxo.service';

@Module({
  controllers: [ModeloFluxoController],
  providers: [ModeloFluxoService],
  exports: [ModeloFluxoService],
})
export class ModeloFluxoModule {}
