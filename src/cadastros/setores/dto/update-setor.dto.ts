import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class UpdateSetorDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  nome?: string;

  @IsUUID()
  @IsOptional()
  secretariaId?: string;
}
