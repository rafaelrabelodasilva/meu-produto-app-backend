# 🐾 Meu Produto - Backend

O cérebro por trás do **Meu Produto**, um ecossistema inteligente e lúdico para inventário doméstico e colaboração familiar.

## 🚀 Sobre o Projeto

O **Meu Produto** nasceu para que você nunca mais esqueça o tamanho das suas coisas. Quantas vezes você já esteve em uma loja e não soube o tamanho exato da sua mesa para comprar uma toalha, ou o modelo da lâmpada do quarto para comprar uma reserva? Este backend provê uma API robusta e segura para catalogar itens, gerenciar medidas e compartilhar essas informações essenciais com toda a família.

### 🧠 O que ele resolve?

- **Dúvidas de Compra:** "Qual o tamanho da minha cama para o lençol?", "Qual o tamanho da máquina para a capa?".
- **Manutenção Facilitada:** "Qual o modelo exato dessa lâmpada ou filtro?" (acesso rápido a fotos de etiquetas).
- **Gestão Familiar:** Centraliza as medidas do lar para que qualquer membro da família possa consultar antes de uma compra.
- **Fim da Adivinhação:** Substitui o "acho que é esse tamanho" por dados técnicos reais.

## 🛠️ Tecnologias Utilizadas

- **NestJS:** Framework Node.js progressivo para construção de aplicativos eficientes e escaláveis.
- **Prisma:** ORM de próxima geração para Node.js e TypeScript.
- **PostgreSQL:** Banco de dados relacional robusto.
- **Supabase:** Infraestrutura de banco de dados em nuvem.
- **JWT & Passport:** Autenticação segura e proteção de rotas.
- **Multer & Storage:** Gestão de upload de imagens e manuais.
- **Swagger:** Documentação automática da API.

## 🏁 Como Iniciar (Setup do Zero)

Siga os passos abaixo para rodar o backend localmente:

### 1. Requisitos
- Node.js (v18 ou superior)
- Docker (opcional, para banco local) ou instância PostgreSQL

### 2. Instalação
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/meu-produto-app-backend.git

# Acesse a pasta
cd meu-produto-app-backend

# Instale as dependências
npm install
```

### 3. Configuração do Ambiente
Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/meu_produto"
JWT_SECRET="sua_chave_secreta_aqui"
PORT=3000
```

### 4. Banco de Dados
```bash
# Gere o cliente do Prisma
npx prisma generate

# Execute as migrações para criar as tabelas
npx prisma migrate dev
```

### 5. Iniciar a Aplicação
```bash
# Modo de desenvolvimento
npm run start:dev
```

A API estará disponível em `http://localhost:3000`.
Acesse a documentação Swagger em `http://localhost:3000/api/docs`.

## 📜 Comandos Úteis

| Comando | Descrição |
| :--- | :--- |
| `npm run start:dev` | Inicia o servidor em modo de observação (hot-reload) |
| `npm run build` | Compila o projeto para produção |
| `npx prisma studio` | Abre o painel visual para gerenciar dados do banco |
| `npm run lint` | Executa o linter para garantir padrões de código |
| `npm run test` | Executa os testes unitários |

## 👨‍💻 Autor

**Rafael Rabelo da Silva**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/rafaelrabelodasilva/)

---
*Gerencie seu lar com o Gatinho Organizador 🐾 🐱*
