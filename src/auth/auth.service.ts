import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
      include: {
        secretaria: true,
        setor: true,
        fornecedor: true,
      },
    });

    if (!usuario) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const senhaValida = await bcrypt.compare(dto.senha, usuario.senha);

    if (!senhaValida) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const payload = {
      id: usuario.id,
      email: usuario.email,
      role: usuario.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      id: usuario.id,
      email: usuario.email,
      nome: usuario.nome,
      role: usuario.role,
      secretariaId: usuario.secretariaId,
      setorId: usuario.setorId,
      fornecedorId: usuario.fornecedorId,
      secretaria: usuario.secretaria ? { nome: usuario.secretaria.nome, sigla: usuario.secretaria.sigla } : null,
      setor: usuario.setor ? { nome: usuario.setor.nome } : null,
      fornecedor: usuario.fornecedor ? { id: usuario.fornecedor.id, razaoSocial: usuario.fornecedor.razaoSocial } : null,
      accessToken,
    };
  }

  async me(usuarioId: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        secretariaId: true,
        setorId: true,
        fornecedorId: true,
        createdAt: true,
        secretaria: true,
        setor: { include: { secretaria: true } },
        fornecedor: true,
      },
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return usuario;
  }

  async register(dto: RegisterDto) {
    const existente = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });

    if (existente) {
      throw new BadRequestException('Email já cadastrado');
    }

    const senhaHash = await bcrypt.hash(dto.senha, 10);

    const usuario = await this.prisma.usuario.create({
      data: {
        nome: dto.nome,
        email: dto.email,
        senha: senhaHash,
        role: dto.role,
        secretariaId: dto.secretariaId,
        setorId: dto.setorId,
        fornecedorId: dto.fornecedorId,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        secretariaId: true,
        setorId: true,
        fornecedorId: true,
        createdAt: true,
      },
    });

    return usuario;
  }
}
