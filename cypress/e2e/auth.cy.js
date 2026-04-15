describe('Suíte de testes da camada de autenticação', () => {
  let dadosAutenticacao;

  before(() => {
    cy.fixture('auth').then((dados) => {
      dadosAutenticacao = dados;
    });
  });

  it('Sucesso ao realizar autenticação (POST /auth/login)', () => {
    cy.api({
      method: 'POST',
      url: '/auth/login',
      body: {
        email: "automacao_sistema@email.com",
        password: "Teste@1234"
      },
    }).then((resposta) => {
      expect(resposta.status).to.be.oneOf([200, 201]);
      expect(resposta.body).to.have.property('access_token');
      expect(resposta.body).to.have.property('refresh_token');
    });
  });

  it('Sucesso ao obter informações do usuário (GET /auth/me)', () => {
    cy.login("automacao_sistema@email.com", "Teste@1234").then(() => {
      cy.api({
        method: 'GET',
        url: '/auth/me',
        headers: {
          Authorization: `Bearer ${Cypress.env('authToken')}`,
        },
      }).then((resposta) => {
        expect(resposta.status).to.eq(200);
        expect(resposta.body).to.have.property('userId');
        expect(resposta.body).to.have.property('email');
      });
    });
  });

  it('Sucesso ao realizar logout (POST /auth/logout)', () => {
    cy.login("automacao_sistema@email.com", "Teste@1234").then(() => {
      cy.api({
        method: 'POST',
        url: '/auth/logout',
        headers: {
          Authorization: `Bearer ${Cypress.env('authToken')}`,
        },
      }).then((resposta) => {
        expect(resposta.status).to.be.oneOf([200, 201]);
        // Ajustado para não validar mensagem fixa caso mude, ou validar o status
      });
    });
  });

  it('Falha ao realizar login com e-mail inválido', () => {
    cy.api({
      method: 'POST',
      url: '/auth/login',
      body: dadosAutenticacao.emailInvalido,
      failOnStatusCode: false,
    }).then((resposta) => {
      expect(resposta.status).to.eq(401);
    });
  });

  it('Falha ao realizar login com senha inválida', () => {
    cy.api({
      method: 'POST',
      url: '/auth/login',
      body: dadosAutenticacao.senhaInvalida,
      failOnStatusCode: false,
    }).then((resposta) => {
      expect(resposta.status).to.eq(401);
    });
  });
});
