import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSecretariaDto } from './dto/create-secretaria.dto';
import { UpdateSecretariaDto } from './dto/update-secretaria.dto';

@Injectable()
export class SecretariasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSecretariaDto) {
    return this.prisma.secretaria.create({
      data: dto,
    });
  }

  async findAll() {
    return this.prisma.secretaria.findMany({
      orderBy: { nome: 'asc' },
    });
  }

  async findOne(id: string) {
    const secretaria = await this.prisma.secretaria.findUnique({
      where: { id },
      include: { setores: true },
    });

    if (!secretaria) {
      throw new NotFoundException('Secretaria não encontrada');
    }

    return secretaria;
  }

  async update(id: string, dto: UpdateSecretariaDto) {
    const secretaria = await this.prisma.secretaria.findUnique({
      where: { id },
    });

    if (!secretaria) {
      throw new NotFoundException('Secretaria não encontrada');
    }

    return this.prisma.secretaria.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const secretaria = await this.prisma.secretaria.findUnique({
      where: { id },
    });

    if (!secretaria) {
      throw new NotFoundException('Secretaria não encontrada');
    }

    return this.prisma.secretaria.delete({
      where: { id },
    });
  }
}
