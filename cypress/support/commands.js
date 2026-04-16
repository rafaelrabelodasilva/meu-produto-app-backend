const { faker } = require('@faker-js/faker');

// Comandos de Criação para Automação
Cypress.Commands.add('criarUsuario', (overrides = {}) => {
  const user = {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email().toLowerCase(),
    password: "Teste@1234",
    ...overrides
  };

  return cy.api({
    method: 'POST',
    url: '/users',
    body: user,
  }).then(response => {
    expect(response.status).to.eq(201);
    return { ...response.body, password: user.password };
  });
});

Cypress.Commands.add('criarCategoria', (overrides = {}) => {
  const category = {
    name: faker.commerce.department(),
    ...overrides
  };

  return cy.api({
    method: 'POST',
    url: '/categories',
    headers: {
      'Authorization': `Bearer ${Cypress.env('authToken')}`,
    },
    body: category,
  }).then(response => {
    expect(response.status).to.eq(201);
    return response.body;
  });
});

Cypress.Commands.add('criarProduto', (overrides = {}) => {
  const product = {
    name: faker.commerce.productName(),
    brand: faker.company.name(),
    model: faker.commerce.productMaterial(),
    ...overrides
  };

  return cy.api({
    method: 'POST',
    url: '/products',
    headers: {
      'Authorization': `Bearer ${Cypress.env('authToken')}`,
    },
    body: product,
  }).then(response => {
    expect(response.status).to.eq(201);
    return response.body;
  });
});

Cypress.Commands.add('deletarUsuario', (userId) => {
  if (!userId) return;
  return cy.api({
    method: 'DELETE',
    url: `/users/${userId}`,
    headers: {
      'Authorization': `Bearer ${Cypress.env('authToken')}`
    },
    failOnStatusCode: false // Evita falhas se o usuário já foi removido pelo teste
  });
});

// Comandos de Autenticação e Configuração
Cypress.Commands.add('login', (email, password) => {
  // Se não informar email/senha, utiliza os dados do config.json
  if (!email || !password) {
    return cy.fixture('config').then((config) => {
      const creds = config.automacao;
      return executeLogin(creds.email, creds.password);
    });
  }
  return executeLogin(email, password);
});

function executeLogin(email, password) {
  return cy.request({
    method: 'POST',
    url: '/auth/login',
    headers: { 'Content-Type': 'application/json' },
    body: { email, password },
  }).then((response) => {
    expect(response.status).to.be.oneOf([200, 201]);
    expect(response.body).to.have.property('access_token');
    const token = response.body.access_token;
    Cypress.env('authToken', token);
    cy.log(`Autenticado com sucesso como: ${email}`);
  });
}
