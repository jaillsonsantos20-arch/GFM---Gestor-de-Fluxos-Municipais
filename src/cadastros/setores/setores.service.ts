import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSetorDto } from './dto/create-setor.dto';
import { UpdateSetorDto } from './dto/update-setor.dto';

@Injectable()
export class SetoresService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSetorDto) {
    const secretaria = await this.prisma.secretaria.findUnique({
      where: { id: dto.secretariaId },
    });

    if (!secretaria) {
      throw new NotFoundException('Secretaria não encontrada');
    }

    return this.prisma.setor.create({
      data: dto,
      include: { secretaria: true },
    });
  }

  async findAll() {
    return this.prisma.setor.findMany({
      orderBy: { nome: 'asc' },
      include: { secretaria: true },
    });
  }

  async findOne(id: string) {
    const setor = await this.prisma.setor.findUnique({
      where: { id },
      include: { secretaria: true, usuarios: true },
    });

    if (!setor) {
      throw new NotFoundException('Setor não encontrado');
    }

    return setor;
  }

  async update(id: string, dto: UpdateSetorDto) {
    const setor = await this.prisma.setor.findUnique({
      where: { id },
    });

    if (!setor) {
      throw new NotFoundException('Setor não encontrado');
    }

    if (dto.secretariaId) {
      const secretaria = await this.prisma.secretaria.findUnique({
        where: { id: dto.secretariaId },
      });

      if (!secretaria) {
        throw new NotFoundException('Secretaria não encontrada');
      }
    }

    return this.prisma.setor.update({
      where: { id },
      data: dto,
      include: { secretaria: true },
    });
  }

  async remove(id: string) {
    const setor = await this.prisma.setor.findUnique({
      where: { id },
    });

    if (!setor) {
      throw new NotFoundException('Setor não encontrado');
    }

    return this.prisma.setor.delete({
      where: { id },
    });
  }
}
