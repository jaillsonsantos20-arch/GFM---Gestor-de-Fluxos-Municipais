import { Module } from '@nestjs/common';
import { SecretariasModule } from './secretarias/secretarias.module';
import { SetoresModule } from './setores/setores.module';
import { FornecedoresModule } from './fornecedores/fornecedores.module';

@Module({
  imports: [SecretariasModule, SetoresModule, FornecedoresModule],
})
export class CadastrosModule {}
