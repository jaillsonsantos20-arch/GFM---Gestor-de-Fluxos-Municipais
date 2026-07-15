import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Limpando banco de dados...');
  await prisma.historicoTramitacao.deleteMany();
  await prisma.processo.deleteMany();
  await prisma.modeloFluxo.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.fornecedor.deleteMany();
  await prisma.setor.deleteMany();
  await prisma.secretaria.deleteMany();

  console.log('Criando secretarias...');
  const saude = await prisma.secretaria.create({
    data: { nome: 'Secretaria Municipal de Saúde', sigla: 'SMS' },
  });
  const educacao = await prisma.secretaria.create({
    data: { nome: 'Secretaria Municipal de Educação', sigla: 'SME' },
  });
  const obras = await prisma.secretaria.create({
    data: { nome: 'Secretaria Municipal de Obras', sigla: 'SMO' },
  });
  const admin = await prisma.secretaria.create({
    data: { nome: 'Secretaria Municipal de Administração', sigla: 'SMA' },
  });

  console.log('Criando setores...');
  const farmacia = await prisma.setor.create({
    data: { nome: 'Farmácia Básica', secretariaId: saude.id },
  });
  const vigilancia = await prisma.setor.create({
    data: { nome: 'Vigilância Sanitária', secretariaId: saude.id },
  });
  const merenda = await prisma.setor.create({
    data: { nome: 'Merenda Escolar', secretariaId: educacao.id },
  });
  const transporte = await prisma.setor.create({
    data: { nome: 'Transporte Escolar', secretariaId: educacao.id },
  });
  const engenharia = await prisma.setor.create({
    data: { nome: 'Engenharia', secretariaId: obras.id },
  });
  const almoxarifado = await prisma.setor.create({
    data: { nome: 'Almoxarifado Central', secretariaId: admin.id },
  });
  const licitacoes = await prisma.setor.create({
    data: { nome: 'Licitações e Contratos', secretariaId: admin.id },
  });

  console.log('Criando fornecedores...');
  await prisma.fornecedor.create({
    data: {
      cnpj: '11.222.333/0001-81',
      razaoSocial: 'MedPharma Distribuidora Ltda',
      contato: 'contato@medpharma.com.br',
    },
  });
  await prisma.fornecedor.create({
    data: {
      cnpj: '44.555.666/0001-92',
      razaoSocial: 'ConstruMax Materiais Eireli',
      contato: 'vendas@construMax.com.br',
    },
  });
  await prisma.fornecedor.create({
    data: {
      cnpj: '77.888.999/0001-13',
      razaoSocial: 'AlimentaBem Refeições Coletivas S.A.',
      contato: 'comercial@alimentabem.com.br',
    },
  });

  console.log('Criando modelos de fluxo...');
  await prisma.modeloFluxo.create({
    data: {
      nome: 'Aquisição de Medicamentos',
      fluxoSequencial: [
        { etapa: 1, setorId: farmacia.id },
        { etapa: 2, setorId: licitacoes.id },
        { etapa: 3, setorId: almoxarifado.id },
      ],
    },
  });
  await prisma.modeloFluxo.create({
    data: {
      nome: 'Obras Públicas',
      fluxoSequencial: [
        { etapa: 1, setorId: engenharia.id },
        { etapa: 2, setorId: licitacoes.id },
      ],
    },
  });

  console.log('Criando usuários...');
  const senhaAdmin = await bcrypt.hash('admin123', 10);
  const senhaOperador = await bcrypt.hash('operador123', 10);

  await prisma.usuario.create({
    data: {
      nome: 'Administrador Geral',
      email: 'admin@gfm.com',
      senha: senhaAdmin,
      role: Role.GESTOR,
    },
  });

  await prisma.usuario.create({
    data: {
      nome: 'João Saúde',
      email: 'joao@gfm.com',
      senha: senhaOperador,
      role: Role.OPERADOR_SETOR,
      secretariaId: saude.id,
      setorId: farmacia.id,
    },
  });

  await prisma.usuario.create({
    data: {
      nome: 'Maria Educação',
      email: 'maria@gfm.com',
      senha: senhaOperador,
      role: Role.OPERADOR_SETOR,
      secretariaId: educacao.id,
      setorId: merenda.id,
    },
  });

  await prisma.usuario.create({
    data: {
      nome: 'Carlos Obras',
      email: 'carlos@gfm.com',
      senha: senhaOperador,
      role: Role.OPERADOR_SETOR,
      secretariaId: obras.id,
      setorId: engenharia.id,
    },
  });

  const senhaSecretaria = await bcrypt.hash('secretaria123', 10);
  const senhaFornecedor = await bcrypt.hash('fornecedor123', 10);

  await prisma.usuario.create({
    data: {
      nome: 'Ana Saúde',
      email: 'ana@gfm.com',
      senha: senhaSecretaria,
      role: Role.SECRETARIA,
      secretariaId: saude.id,
    },
  });

  await prisma.usuario.create({
    data: {
      nome: 'Pedro Educação',
      email: 'pedro@gfm.com',
      senha: senhaSecretaria,
      role: Role.SECRETARIA,
      secretariaId: educacao.id,
    },
  });

  const medPharma = await prisma.fornecedor.findFirst({ where: { cnpj: '11.222.333/0001-81' } });
  const construMax = await prisma.fornecedor.findFirst({ where: { cnpj: '44.555.666/0001-92' } });

  if (medPharma) {
    await prisma.usuario.create({
      data: {
        nome: 'Fornecedor MedPharma',
        email: 'medpharma@gfm.com',
        senha: senhaFornecedor,
        role: Role.FORNECEDOR,
        fornecedorId: medPharma.id,
      },
    });
  }

  if (construMax) {
    await prisma.usuario.create({
      data: {
        nome: 'Fornecedor ConstruMax',
        email: 'construMax@gfm.com',
        senha: senhaFornecedor,
        role: Role.FORNECEDOR,
        fornecedorId: construMax.id,
      },
    });
  }

  console.log('Seed concluído com sucesso!');
  console.log('');
  console.log('Usuários criados:');
  console.log('  admin@gfm.com     / admin123         (GESTOR)');
  console.log('  joao@gfm.com      / operador123      (OPERADOR_SETOR - Farmácia)');
  console.log('  maria@gfm.com     / operador123      (OPERADOR_SETOR - Merenda)');
  console.log('  carlos@gfm.com    / operador123      (OPERADOR_SETOR - Engenharia)');
  console.log('  ana@gfm.com       / secretaria123    (SECRETARIA - SMS)');
  console.log('  pedro@gfm.com     / secretaria123    (SECRETARIA - SME)');
  console.log('  medpharma@gfm.com / fornecedor123    (FORNECEDOR - MedPharma)');
  console.log('  construMax@gfm.com / fornecedor123   (FORNECEDOR - ConstruMax)');
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
