import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProcessoDto } from './dto/create-processo.dto';
import { UpdateProcessoDto } from './dto/update-processo.dto';
import { TramitarProcessoDto } from './dto/tramitar-processo.dto';

@Injectable()
export class ProcessosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProcessoDto, usuarioId: string) {
    return this.prisma.$transaction(async (tx) => {
      const usuario = await tx.usuario.findUnique({
        where: { id: usuarioId },
      });

      if (!usuario) {
        throw new NotFoundException('Usuário não encontrado');
      }

      let setorResponsavelId = '';

      if (dto.modeloId) {
        const modelo = await tx.modeloFluxo.findUnique({
          where: { id: dto.modeloId },
        });

        if (!modelo) {
          throw new NotFoundException('Modelo de fluxo não encontrado');
        }

        const fluxo = modelo.fluxoSequencial as { etapa: number; setorId: string }[];
        const primeiraEtapa = fluxo.find((e) => e.etapa === 1);

        if (!primeiraEtapa) {
          throw new BadRequestException('O modelo de fluxo não possui uma etapa 1 definida');
        }

        setorResponsavelId = primeiraEtapa.setorId;
      } else if (dto.setorId) {
        setorResponsavelId = dto.setorId;
      } else if (usuario.setorId) {
        setorResponsavelId = usuario.setorId;
      } else {
        throw new BadRequestException('Selecione um modelo de fluxo ou um setor responsável para criar o processo.');
      }

      const setor = await tx.setor.findUnique({
        where: { id: setorResponsavelId },
      });

      if (!setor) {
        throw new NotFoundException('Setor responsável não encontrado');
      }

      return tx.processo.create({
        data: {
          titulo: dto.titulo,
          descricao: dto.descricao,
          status: 'ABERTO',
          fornecedorId: dto.fornecedorId,
          modeloId: dto.modeloId,
          setorResponsavelId,
          criadoPorId: usuarioId,
          anexos: dto.anexos || [],
        },
        include: {
          fornecedor: true,
          modelo: true,
          setorResponsavel: true,
          criadoPor: true,
        },
      });
    });
  }

  async findAll(
    setorId: string | undefined,
    status: string | undefined,
    secretariaId: string | undefined,
    fornecedorId: string | undefined,
    dataInicio: string | undefined,
    dataFim: string | undefined,
    usuario: { id: string; role: string; fornecedorId?: string; secretariaId?: string },
  ) {
    const where: any = {};

    if (usuario.role === 'FORNECEDOR') {
      where.fornecedorId = usuario.fornecedorId;
    } else if (usuario.role === 'SECRETARIA') {
      where.setorResponsavel = { secretariaId: usuario.secretariaId };
    } else if (usuario.role === 'OPERADOR_SETOR') {
      if (setorId) {
        where.setorResponsavelId = setorId;
      }
    }

    if (status) {
      where.status = status;
    }

    if (secretariaId) {
      where.setorResponsavel = { ...where.setorResponsavel, secretariaId };
    }

    if (fornecedorId) {
      where.fornecedorId = fornecedorId;
    }

    if (dataInicio || dataFim) {
      where.createdAt = {};
      if (dataInicio) where.createdAt.gte = new Date(dataInicio);
      if (dataFim) where.createdAt.lte = new Date(dataFim + 'T23:59:59.999Z');
    }

    return this.prisma.processo.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        fornecedor: true,
        modelo: true,
        setorResponsavel: { include: { secretaria: true } },
        criadoPor: { select: { id: true, nome: true, email: true } },
        historicos: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
  }

  async findNovos(usuario: { id: string; role: string; fornecedorId?: string; secretariaId?: string }) {
    const where: any = {};

    if (usuario.role === 'FORNECEDOR') {
      where.fornecedorId = usuario.fornecedorId;
    } else if (usuario.role === 'SECRETARIA') {
      where.setorResponsavel = { secretariaId: usuario.secretariaId };
    }

    where.createdAt = { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) };

    const [count, processos] = await Promise.all([
      this.prisma.processo.count({ where }),
      this.prisma.processo.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          titulo: true,
          status: true,
          createdAt: true,
          criadoPor: { select: { nome: true } },
          setorResponsavel: { select: { nome: true } },
        },
      }),
    ]);

    return { count, processos };
  }

  async findOne(id: string) {
    const processo = await this.prisma.processo.findUnique({
      where: { id },
      include: {
        fornecedor: true,
        modelo: true,
        setorResponsavel: { include: { secretaria: true } },
        criadoPor: { select: { id: true, nome: true, email: true } },
        historicos: {
          orderBy: { createdAt: 'asc' },
          include: {
            origem: { select: { id: true, nome: true } },
            destino: { include: { secretaria: true } },
          },
        },
      },
    });

    if (!processo) {
      throw new NotFoundException('Processo não encontrado');
    }

    return processo;
  }

  async update(id: string, dto: UpdateProcessoDto, usuarioId: string) {
    const processo = await this.prisma.processo.findUnique({
      where: { id },
    });

    if (!processo) {
      throw new NotFoundException('Processo não encontrado');
    }

    if (processo.criadoPorId !== usuarioId) {
      throw new ForbiddenException('Você não tem permissão para editar este processo');
    }

    return this.prisma.processo.update({
      where: { id },
      data: dto,
      include: {
        fornecedor: true,
        modelo: true,
        setorResponsavel: { include: { secretaria: true } },
        criadoPor: { select: { id: true, nome: true, email: true } },
      },
    });
  }

  async remove(id: string, usuarioId: string) {
    const processo = await this.prisma.processo.findUnique({
      where: { id },
    });

    if (!processo) {
      throw new NotFoundException('Processo não encontrado');
    }

    if (processo.criadoPorId !== usuarioId) {
      throw new ForbiddenException('Você não tem permissão para excluir este processo');
    }

    await this.prisma.historicoTramitacao.deleteMany({
      where: { processoId: id },
    });

    return this.prisma.processo.delete({
      where: { id },
    });
  }

  async tramitar(processoId: string, dto: TramitarProcessoDto, usuarioId: string) {
    return this.prisma.$transaction(async (tx) => {
      const processo = await tx.processo.findUnique({
        where: { id: processoId },
      });

      if (!processo) {
        throw new NotFoundException('Processo não encontrado');
      }

      const destinoSetor = await tx.setor.findUnique({
        where: { id: dto.destinoSetorId },
      });

      if (!destinoSetor) {
        throw new NotFoundException('Setor de destino não encontrado');
      }

      const origemUsuario = await tx.usuario.findUnique({
        where: { id: usuarioId },
      });

      if (!origemUsuario) {
        throw new NotFoundException('Usuário remetente não encontrado');
      }

      if (processo.status === dto.status) {
        throw new BadRequestException(
          `O processo já está com o status ${dto.status}`,
        );
      }

      await tx.processo.update({
        where: { id: processoId },
        data: {
          status: dto.status,
          setorResponsavelId: dto.destinoSetorId,
        },
      });

      const historico = await tx.historicoTramitacao.create({
        data: {
          processoId,
          origemId: usuarioId,
          destinoId: dto.destinoSetorId,
          mensagem: dto.mensagem,
          statusAlterado: dto.status,
        },
      });

      return historico;
    });
  }
}
