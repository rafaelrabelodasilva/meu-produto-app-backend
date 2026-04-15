// Comandos de Criação para Atomização
Cypress.Commands.add('criarUsuario', (overrides = {}) => {
  const randomSuffix = Math.floor(Math.random() * 1000000);
  const user = {
    firstName: "Teste",
    lastName: "Automacao",
    email: `automacao_${randomSuffix}@email.com`,
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
  const randomSuffix = Math.floor(Math.random() * 1000000);
  const category = {
    name: `Categoria ${randomSuffix}`,
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
  const randomSuffix = Math.floor(Math.random() * 1000000);
  const product = {
    name: `Produto ${randomSuffix}`,
    brand: "Marca Automacao",
    model: "Modelo X",
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

// Comandos de Autenticação e Setup Centralizados
Cypress.Commands.add('login', (email, password) => {
  // Se não passar email/senha, busca do config.json
  if (!email || !password) {
    return cy.fixture('config').then((config) => {
      const creds = config.automacao;
      return executeLogin(email || creds.email, password || creds.password);
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
    cy.log(`Logado como ${email}`);
  });
}

Cypress.Commands.add('garantirUsuarioAutomacao', () => {
  cy.fixture('config').then((config) => {
    const { email } = config.automacao;
    const passwordHash = '$2b$10$zIdo2gVCM.SYZNxLimu0oOifRL67uuVmmBKcukno.X4W/mVYRNURi'; 
    
    const sql = `
      INSERT INTO "users" ("id", "email", "password", "first_name", "last_name", "created_at", "updated_at")
      VALUES ('${crypto.randomUUID()}', '${email}', '${passwordHash}', 'Sistema', 'Automacao', NOW(), NOW())
      ON CONFLICT ("email") DO NOTHING;
    `;

    return cy.task('queryDb', sql).then(() => {
      cy.log(`Usuário de automação (${email}) garantido via SQL.`);
    });
  });
});
