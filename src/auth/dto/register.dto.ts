import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  senha: string;

  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;

  @IsUUID()
  @IsOptional()
  secretariaId?: string;

  @IsUUID()
  @IsOptional()
  setorId?: string;

  @IsUUID()
  @IsOptional()
  fornecedorId?: string;
}
