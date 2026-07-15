import { IsNotEmpty, IsString, IsOptional, IsUUID, IsInt, IsArray } from 'class-validator';

export class CreateProcessoDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsNotEmpty()
  descricao: string;

  @IsUUID()
  @IsOptional()
  fornecedorId?: string;

  @IsInt()
  @IsOptional()
  modeloId?: number;

  @IsUUID()
  @IsOptional()
  setorId?: string;

  @IsArray()
  @IsOptional()
  anexos?: string[];
}
