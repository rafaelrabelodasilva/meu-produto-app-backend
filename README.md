# meu-produto-app

> Algumas coisas não deveriam ser esquecidas.

Backend em desenvolvimento.

## ⚙️ Stack

- Node.js  
- NestJS  
- Prisma ORM  
- PostgreSQL  
- TypeScript  

## 🚀 Iniciando

Clone [este respositório](https://github.com/rafaelrabelodasilva/meu-produto-app-backend) e instale as dependências:

```bash
git clone <repo-url>
cd meu-produto-app-backend
npm install
```

Crie o arquivo `.env` na raiz do projeto (*No mesmo nível do package.json*):
```
DATABASE_URL="postgresql://usuario:senha@localhost:5432/meu-produto-app"
```

Execute as migrations:

```bash
$ npx prisma migrate dev
$ npx prisma generate
```

Inicie o servidor:

```bash
$ npm run start:dev
```

## 📌 Status

🚧 Em desenvolvimento.

<!-- ![CI](https://github.com/rafaelrabelodasilva/meu-produto-app-backend/actions/workflows/ci.yml/badge.svg) -->

## 👨‍💻 Autor

[Rafael Rabelo da Silva](https://www.linkedin.com/in/rafaelrabelodasilva/)