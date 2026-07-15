import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ProcessosService } from './processos.service';
import { CreateProcessoDto } from './dto/create-processo.dto';
import { UpdateProcessoDto } from './dto/update-processo.dto';
import { TramitarProcessoDto } from './dto/tramitar-processo.dto';

@Controller('processos')
@UseGuards(JwtAuthGuard)
export class ProcessosController {
  constructor(private readonly processosService: ProcessosService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('GESTOR', 'OPERADOR_SETOR', 'SECRETARIA')
  create(
    @Body() dto: CreateProcessoDto,
    @CurrentUser() usuario: { id: string },
  ) {
    return this.processosService.create(dto, usuario.id);
  }

  @Get()
  findAll(
    @CurrentUser() usuario: { id: string; role: string; fornecedorId?: string; secretariaId?: string },
    @Query('setorId') setorId?: string,
    @Query('status') status?: string,
    @Query('secretariaId') secretariaId?: string,
    @Query('fornecedorId') fornecedorId?: string,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
  ) {
    return this.processosService.findAll(setorId, status, secretariaId, fornecedorId, dataInicio, dataFim, usuario);
  }

  @Get('novos')
  findNovos(
    @CurrentUser() usuario: { id: string; role: string; fornecedorId?: string; secretariaId?: string },
  ) {
    return this.processosService.findNovos(usuario);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.processosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProcessoDto,
    @CurrentUser() usuario: { id: string },
  ) {
    return this.processosService.update(id, dto, usuario.id);
  }

  @Post(':id/tramitar')
  tramitar(
    @Param('id') id: string,
    @Body() dto: TramitarProcessoDto,
    @CurrentUser() usuario: { id: string },
  ) {
    return this.processosService.tramitar(id, dto, usuario.id);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() usuario: { id: string },
  ) {
    return this.processosService.remove(id, usuario.id);
  }
}
