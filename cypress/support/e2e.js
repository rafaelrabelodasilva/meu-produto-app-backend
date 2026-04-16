require('./commands');
require('cypress-plugin-api');
require('cypress-mochawesome-reporter/register');

// Antes de cada Spec, garantimos que o usuário de automação padrão exista no banco
// Isso evita erros 401 se o spec anterior limpou o banco via TRUNCATE
beforeEach(() => {
  cy.fixture('config').then((config) => {
    const creds = config.automacao;
    cy.api({
      method: 'POST',
      url: '/users',
      body: {
        firstName: "Sistema",
        lastName: "Automacao",
        email: creds.email,
        password: creds.password
      },
      failOnStatusCode: false // Ignora o erro 409 se o usuário já existir
    });
  });
});

// Limpeza TOTAL do banco ao FINAL de cada arquivo de teste (spec)
// O TRUNCATE reseta as tabelas e os contadores de ID de forma atômica
after(() => {
  const sql = `
    DO $$ 
    BEGIN 
      EXECUTE 'TRUNCATE TABLE "users", "products", "categories", "ProductImage" RESTART IDENTITY CASCADE';
    EXCEPTION WHEN OTHERS THEN
      EXECUTE 'TRUNCATE TABLE "users", "Product", "Category", "ProductImage" RESTART IDENTITY CASCADE';
    END $$;
  `;

  cy.task('queryDb', sql).then(() => {
    cy.log('O Banco de dados local foi limpo e resetado com sucesso.');
  });
});
