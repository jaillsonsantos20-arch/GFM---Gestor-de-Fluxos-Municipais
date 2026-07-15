import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateFornecedorDto {
  @IsString()
  @IsOptional()
  @MaxLength(18)
  cnpj?: string;

  @IsString()
  @IsOptional()
  @MaxLength(300)
  razaoSocial?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  contato?: string;
}
