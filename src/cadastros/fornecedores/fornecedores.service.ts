import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFornecedorDto } from './dto/create-fornecedor.dto';
import { UpdateFornecedorDto } from './dto/update-fornecedor.dto';

@Injectable()
export class FornecedoresService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateFornecedorDto) {
    const existente = await this.prisma.fornecedor.findUnique({
      where: { cnpj: dto.cnpj },
    });

    if (existente) {
      throw new ConflictException('CNPJ já cadastrado');
    }

    return this.prisma.fornecedor.create({
      data: dto,
    });
  }

  async findAll() {
    return this.prisma.fornecedor.findMany({
      orderBy: { razaoSocial: 'asc' },
    });
  }

  async findOne(id: string) {
    const fornecedor = await this.prisma.fornecedor.findUnique({
      where: { id },
    });

    if (!fornecedor) {
      throw new NotFoundException('Fornecedor não encontrado');
    }

    return fornecedor;
  }

  async update(id: string, dto: UpdateFornecedorDto) {
    const fornecedor = await this.prisma.fornecedor.findUnique({
      where: { id },
    });

    if (!fornecedor) {
      throw new NotFoundException('Fornecedor não encontrado');
    }

    if (dto.cnpj && dto.cnpj !== fornecedor.cnpj) {
      const existente = await this.prisma.fornecedor.findUnique({
        where: { cnpj: dto.cnpj },
      });

      if (existente) {
        throw new ConflictException('CNPJ já cadastrado');
      }
    }

    return this.prisma.fornecedor.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const fornecedor = await this.prisma.fornecedor.findUnique({
      where: { id },
    });

    if (!fornecedor) {
      throw new NotFoundException('Fornecedor não encontrado');
    }

    return this.prisma.fornecedor.delete({
      where: { id },
    });
  }
}
