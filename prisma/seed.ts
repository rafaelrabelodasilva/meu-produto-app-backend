import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main() {
  const email = 'automacao_sistema@email.com';
  const password = 'Teste@1234';
  const salt = await bcrypt.genSalt();
  const passwordHash = await bcrypt.hash(password, salt);

  console.log('Semeando banco de dados...');

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

  console.log({ user });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
