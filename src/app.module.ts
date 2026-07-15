import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CadastrosModule } from './cadastros/cadastros.module';
import { ProcessosModule } from './processos/processos.module';
import { ModeloFluxoModule } from './modelo-fluxo/modelo-fluxo.module';

@Module({
  imports: [PrismaModule, AuthModule, CadastrosModule, ProcessosModule, ModeloFluxoModule],
})
export class AppModule {}
