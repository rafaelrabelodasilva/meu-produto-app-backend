Cypress.Commands.add(
  'login',
  (email = 'rafael@email.com', password = 'Teste@1234') => {
    return cy
      .request({
        method: 'POST',
        url: 'http://localhost:3000/auth/login',
        headers: {
          'Content-Type': 'application/json',
        },
        body: { email, password },
      })
      .then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('access_token');

        const token = response.body.access_token;
        Cypress.env('authToken', token);
        cy.log('Logged in via custom command and stored auth token.');

        return token;
      });
  },
);
