import { IsOptional, IsString, IsArray } from 'class-validator';

export class UpdateModeloFluxoDto {
  @IsString()
  @IsOptional()
  nome?: string;

  @IsArray()
  @IsOptional()
  fluxoSequencial?: Record<string, unknown>[];
}
