describe('Suíte de testes da camada de autenticação', () => {
  let dadosAutenticacao;

  before(() => {
    // Carrega a massa de dados (fixture) em português
    cy.fixture('auth').then((dados) => {
      dadosAutenticacao = dados;
    });
  });

  beforeEach(() => {
    cy.api({
      method: 'POST',
      url: '/auth/login',
      headers: {
        'Content-Type': 'application/json',
      },
      body: dadosAutenticacao.usuarioValido,
    }).then((resposta) => {
      expect(resposta.status).to.eq(201);
      expect(resposta.body).to.have.property('access_token');
      // Armazena o token globalmente para uso nos testes
      Cypress.env('tokenAcesso', resposta.body.access_token);
      cy.log('Token de autenticação obtido e armazenado com sucesso.');
    });
  });

  it('Sucesso ao realizar autenticação através do endpoint /auth/login', () => {
    cy.api({
      method: 'POST',
      url: '/auth/login',
      headers: {
        'Content-Type': 'application/json',
      },
      body: dadosAutenticacao.usuarioValido,
    }).then((resposta) => {
      expect(resposta.status).to.eq(201);
      expect(resposta.body).to.have.property('access_token');
      expect(resposta.body).to.have.property('refresh_token');
    });
  });

  it('Sucesso ao obter informações do usuário autenticado através do endpoint /auth/me', () => {
    const token = Cypress.env('tokenAcesso');
    cy.api({
      method: 'GET',
      url: '/auth/me',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((resposta) => {
      expect(resposta.status).to.eq(200);
      expect(resposta.body).to.have.property('userId');
      expect(resposta.body).to.have.property('email');
      expect(resposta.body.email).to.eq(dadosAutenticacao.usuarioValido.email);
    });
  });

  it('Sucesso ao realizar logout através do endpoint /auth/logout', () => {
    const token = Cypress.env('tokenAcesso');
    cy.api({
      method: 'POST',
      url: '/auth/logout',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((resposta) => {
      expect(resposta.status).to.eq(201);
      // Limpa o token após o logout
      Cypress.env('tokenAcesso', null);
      expect(resposta.body).to.have.property(
        'message',
        'Logout realizado com sucesso',
      );
    });
  });

  it('Falha ao realizar autenticação com e-mail inválido', () => {
    cy.api({
      method: 'POST',
      url: '/auth/login',
      headers: {
        'Content-Type': 'application/json',
      },
      body: dadosAutenticacao.emailInvalido,
      failOnStatusCode: false,
    }).then((resposta) => {
      expect(resposta.status).to.eq(401);
      expect(resposta.body).to.have.property('message', 'Usuário inválido');
    });
  });

  it('Falha ao realizar autenticação com senha inválida', () => {
    cy.api({
      method: 'POST',
      url: '/auth/login',
      headers: {
        'Content-Type': 'application/json',
      },
      body: dadosAutenticacao.senhaInvalida,
      failOnStatusCode: false,
    }).then((resposta) => {
      expect(resposta.status).to.eq(401);
      expect(resposta.body).to.have.property('message', 'Senha inválida');
    });
  });
});
