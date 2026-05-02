describe('Suíte de testes da camada de autenticação', () => {
  let dadosAutenticacao;
  let usuarioTeste;

  before(() => {
    cy.fixture('auth').then((dados) => {
      dadosAutenticacao = dados;
    });
    // Cria um usuário novo para garantir que ele existe no ambiente atual
    cy.criarUsuario().then((user) => {
      usuarioTeste = user;
    });
  });

  it('Sucesso ao realizar autenticação (POST /auth/login)', () => {
    cy.api({
      method: 'POST',
      url: '/auth/login',
      body: {
        email: usuarioTeste.email,
        password: usuarioTeste.password
      },
    }).then((resposta) => {
      expect(resposta.status).to.be.oneOf([200, 201]);
      expect(resposta.body).to.have.property('access_token');
      expect(resposta.body).to.have.property('refresh_token');
    });
  });

  it('Sucesso ao obter informações do usuário (GET /auth/me)', () => {
    cy.login(usuarioTeste.email, usuarioTeste.password).then(() => {
      cy.api({
        method: 'GET',
        url: '/auth/me',
        headers: {
          Authorization: `Bearer ${Cypress.env('authToken')}`,
        },
      }).then((resposta) => {
        expect(resposta.status).to.eq(200);
        expect(resposta.body).to.have.property('userId');
        expect(resposta.body).to.have.property('email', usuarioTeste.email);
      });
    });
  });

  it('Sucesso ao realizar logout (POST /auth/logout)', () => {
    cy.login().then(() => {
      cy.api({
        method: 'POST',
        url: '/auth/logout',
        headers: {
          Authorization: `Bearer ${Cypress.env('authToken')}`,
        },
      }).then((resposta) => {
        expect(resposta.status).to.be.oneOf([200, 201]);
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
