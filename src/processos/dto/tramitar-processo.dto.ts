import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { StatusProcesso } from '@prisma/client';

export class TramitarProcessoDto {
  @IsUUID()
  @IsNotEmpty()
  destinoSetorId: string;

  @IsString()
  @IsNotEmpty()
  mensagem: string;

  @IsEnum(StatusProcesso)
  @IsNotEmpty()
  status: StatusProcesso;
}
