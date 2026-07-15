import { IsOptional, IsString, IsUUID, IsInt, IsArray } from 'class-validator';

export class UpdateProcessoDto {
  @IsString()
  @IsOptional()
  titulo?: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsUUID()
  @IsOptional()
  fornecedorId?: string;

  @IsInt()
  @IsOptional()
  modeloId?: number;

  @IsArray()
  @IsOptional()
  anexos?: string[];
}
