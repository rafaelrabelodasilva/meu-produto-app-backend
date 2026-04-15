import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

async function main() {
  const prisma = new PrismaClient();

  try {
    const password = await bcrypt.hash('Teste@1234', 10);
    const email = 'automacao_sistema@email.com';

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        password,
        firstName: 'Sistema',
        lastName: 'Automacao',
      },
    });

    console.log('Seed concluído com sucesso:');
    console.log({ id: user.id, email: user.email });
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error('Erro ao executar o seed:');
  console.error(e);
  process.exit(1);
});
