import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateSecretariaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nome: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  sigla: string;
}
