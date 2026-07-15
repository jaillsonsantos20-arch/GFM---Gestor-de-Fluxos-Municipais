import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateModeloFluxoDto } from './dto/create-modelo-fluxo.dto';
import { UpdateModeloFluxoDto } from './dto/update-modelo-fluxo.dto';

@Injectable()
export class ModeloFluxoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateModeloFluxoDto) {
    return this.prisma.modeloFluxo.create({
      data: {
        nome: dto.nome,
        fluxoSequencial: dto.fluxoSequencial as Prisma.InputJsonValue,
      },
    });
  }

  async findAll() {
    return this.prisma.modeloFluxo.findMany({
      orderBy: { nome: 'asc' },
    });
  }

  async findOne(id: number) {
    const modelo = await this.prisma.modeloFluxo.findUnique({
      where: { id },
      include: { processos: { take: 5, orderBy: { createdAt: 'desc' } } },
    });

    if (!modelo) {
      throw new NotFoundException('Modelo de fluxo não encontrado');
    }

    return modelo;
  }

  async update(id: number, dto: UpdateModeloFluxoDto) {
    const modelo = await this.prisma.modeloFluxo.findUnique({ where: { id } });
    if (!modelo) throw new NotFoundException('Modelo de fluxo não encontrado');
    return this.prisma.modeloFluxo.update({
      where: { id },
      data: {
        ...(dto.nome !== undefined && { nome: dto.nome }),
        ...(dto.fluxoSequencial !== undefined && { fluxoSequencial: dto.fluxoSequencial as Prisma.InputJsonValue }),
      },
    });
  }

  async remove(id: number) {
    const modelo = await this.prisma.modeloFluxo.findUnique({
      where: { id },
    });

    if (!modelo) {
      throw new NotFoundException('Modelo de fluxo não encontrado');
    }

    return this.prisma.modeloFluxo.delete({
      where: { id },
    });
  }
}
