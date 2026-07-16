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

  console.log('Criando usuário administrador...');
  const senhaAdmin = await bcrypt.hash('admin123', 10);

  await prisma.usuario.create({
    data: {
      nome: 'Administrador Geral',
      email: 'admin@gfm.com',
      senha: senhaAdmin,
      role: Role.GESTOR,
    },
  });

  console.log('Seed concluído com sucesso!');
  console.log('');
  console.log('Usuário criado:');
  console.log('  admin@gfm.com / admin123 (GESTOR)');
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
