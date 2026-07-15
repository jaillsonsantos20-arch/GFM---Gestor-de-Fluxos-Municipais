import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { SecretariasService } from './secretarias.service';
import { CreateSecretariaDto } from './dto/create-secretaria.dto';
import { UpdateSecretariaDto } from './dto/update-secretaria.dto';

@Controller('secretarias')
@UseGuards(JwtAuthGuard)
export class SecretariasController {
  constructor(private readonly secretariasService: SecretariasService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('GESTOR')
  create(@Body() dto: CreateSecretariaDto) {
    return this.secretariasService.create(dto);
  }

  @Get()
  findAll() {
    return this.secretariasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.secretariasService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('GESTOR')
  update(@Param('id') id: string, @Body() dto: UpdateSecretariaDto) {
    return this.secretariasService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('GESTOR')
  remove(@Param('id') id: string) {
    return this.secretariasService.remove(id);
  }
}
