Cypress.Commands.add('garantirUsuarioAutomacao', () => {
  const email = 'automacao_sistema@email.com';
  // Hash bcrypt real para 'Teste@1234'
  const passwordHash = '$2b$10$zIdo2gVCM.SYZNxLimu0oOifRL67uuVmmBKcukno.X4W/mVYRNURi'; 
  
  const sql = `
    INSERT INTO "users" ("id", "email", "password", "first_name", "last_name", "created_at", "updated_at")
    VALUES ('${crypto.randomUUID()}', '${email}', '${passwordHash}', 'Sistema', 'Automacao', NOW(), NOW())
    ON CONFLICT ("email") DO NOTHING;
  `;

  return cy.task('queryDb', sql).then(() => {
    cy.log('Usuário de automação garantido via SQL direto na tabela "users".');
  });
});

Cypress.Commands.add(
  'login',
  (email = 'automacao_sistema@email.com', password = 'Teste@1234') => {
    return cy
      .request({
        method: 'POST',
        url: '/auth/login',
        headers: {
          'Content-Type': 'application/json',
        },
        body: { email, password },
      })
      .then((response) => {
        // Aceita 200 ou 201
        expect(response.body).to.have.property('access_token');

        const token = response.body.access_token;
        Cypress.env('authToken', token);
        cy.log('Logged in via custom command and stored auth token.');
        
        // Removido o "return token" para evitar erro de concorrência no Cypress
      });
  },
);
