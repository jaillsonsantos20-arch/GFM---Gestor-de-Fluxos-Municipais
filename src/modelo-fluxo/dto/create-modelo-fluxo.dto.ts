import { IsNotEmpty, IsString, IsArray, IsObject } from 'class-validator';

export class CreateModeloFluxoDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsArray()
  @IsNotEmpty()
  fluxoSequencial: Record<string, unknown>[];
}
