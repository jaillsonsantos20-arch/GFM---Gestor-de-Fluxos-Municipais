import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateSecretariaDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  nome?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  sigla?: string;
}
