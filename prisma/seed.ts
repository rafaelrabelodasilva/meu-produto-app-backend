import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

async function main() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  const prisma = new PrismaClient({ adapter });

  const email = 'automacao_sistema@email.com';
  const password = 'Teste@1234';
  const salt = await bcrypt.genSalt();
  const passwordHash = await bcrypt.hash(password, salt);

  console.log('Semeando banco de dados...');
  console.log(`Usando DATABASE_URL: ${process.env.DATABASE_URL ? 'Definida' : 'NÃO DEFINIDA'}`);

  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        password: passwordHash,
        firstName: 'Sistema',
        lastName: 'Automacao',
      },
    });

    console.log('Usuário de automação garantido:', user.email);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error('Erro durante o seed:', e);
    process.exit(1);
  });
