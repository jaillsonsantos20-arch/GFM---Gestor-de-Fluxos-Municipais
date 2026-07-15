import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateSetorDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  nome: string;

  @IsUUID()
  @IsNotEmpty()
  secretariaId: string;
}
