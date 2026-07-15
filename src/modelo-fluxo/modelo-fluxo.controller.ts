import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ModeloFluxoService } from './modelo-fluxo.service';
import { CreateModeloFluxoDto } from './dto/create-modelo-fluxo.dto';
import { UpdateModeloFluxoDto } from './dto/update-modelo-fluxo.dto';

@Controller('modelos-fluxo')
@UseGuards(JwtAuthGuard)
export class ModeloFluxoController {
  constructor(private readonly modeloFluxoService: ModeloFluxoService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('GESTOR')
  create(@Body() dto: CreateModeloFluxoDto) {
    return this.modeloFluxoService.create(dto);
  }

  @Get()
  findAll() {
    return this.modeloFluxoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.modeloFluxoService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('GESTOR')
  update(@Param('id') id: string, @Body() dto: UpdateModeloFluxoDto) {
    return this.modeloFluxoService.update(+id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('GESTOR')
  remove(@Param('id') id: string) {
    return this.modeloFluxoService.remove(+id);
  }
}
