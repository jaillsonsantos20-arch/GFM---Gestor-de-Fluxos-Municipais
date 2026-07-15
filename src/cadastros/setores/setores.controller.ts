import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { SetoresService } from './setores.service';
import { CreateSetorDto } from './dto/create-setor.dto';
import { UpdateSetorDto } from './dto/update-setor.dto';

@Controller('setores')
@UseGuards(JwtAuthGuard)
export class SetoresController {
  constructor(private readonly setoresService: SetoresService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('GESTOR', 'SECRETARIA')
  create(@Body() dto: CreateSetorDto) {
    return this.setoresService.create(dto);
  }

  @Get()
  findAll() {
    return this.setoresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.setoresService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('GESTOR', 'SECRETARIA')
  update(@Param('id') id: string, @Body() dto: UpdateSetorDto) {
    return this.setoresService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('GESTOR', 'SECRETARIA')
  remove(@Param('id') id: string) {
    return this.setoresService.remove(id);
  }
}
