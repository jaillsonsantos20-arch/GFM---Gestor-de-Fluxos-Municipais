import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateFornecedorDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(18)
  cnpj: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  razaoSocial: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  contato: string;
}
