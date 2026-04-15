describe('Suíte de testes da camada de usuários', () => {
  let userId;
  let userFixture;

  before(() => {
    cy.fixture('users').then((dados) => {
      userFixture = dados.novoUsuario;
      // Adiciona um sufixo aleatório para evitar conflitos de email
      userFixture.email = `automacao_${Math.floor(Math.random() * 1000000)}@email.com`;
    });
  });

  it('Deve criar um novo usuário (POST /users)', () => {
    cy.api({
      method: 'POST',
      url: '/users',
      body: userFixture,
    }).then(resposta => {
      expect(resposta.status).to.eq(201);
      expect(resposta.body).to.have.property('id');
      expect(resposta.body).to.have.property('firstName', userFixture.firstName);
      expect(resposta.body).to.have.property('lastName', userFixture.lastName);
      expect(resposta.body).to.have.property('email', userFixture.email);
      expect(resposta.body).to.have.property('password');
      expect(resposta.body).to.have.property('refreshToken');
      expect(resposta.body).to.have.property('createdAt');
      expect(resposta.body).to.have.property('updatedAt');
      
      // Armazena o ID do usuário criado para os próximos testes
      userId = resposta.body.id;
    });
  });

  // Os testes seguintes assumem que o usuário foi criado com sucesso e que o token de autenticação foi obtido
  it('Deve realizar login com o usuário recém-criado (POST /auth)', () => {
    cy.login(userFixture.email, userFixture.password);
  });

  it('Deve listar os usuários (GET /users)', () => {
    cy.api({
      method: 'GET',
      url: '/users',
      headers: {
        'Authorization': `Bearer ${Cypress.env('authToken')}`
      },
    }).then(resposta => {
      expect(resposta.status).to.eq(200);
      expect(resposta.body).to.be.an('array');
      // Verifica se o usuário criado está na lista
      const usuarioEncontrado = resposta.body.find(user => user.id === userId);
      expect(usuarioEncontrado).to.exist;
      expect(usuarioEncontrado).to.have.property('email', userFixture.email);
    });
  });

  it('Deve obter detalhes do próprio usuário (GET /users/:id)', () => {
    cy.api({
      method: 'GET',
      url: `/users/${userId}`,
      headers: {
        'Authorization': `Bearer ${Cypress.env('authToken')}`
      },
    }).then(resposta => {
      expect(resposta.status).to.eq(200);
      expect(resposta.body.id).to.eq(userId);
      expect(resposta.body.firstName).to.eq(userFixture.firstName);
      expect(resposta.body.lastName).to.eq(userFixture.lastName);
      expect(resposta.body.email).to.eq(userFixture.email);
      expect(resposta.body).to.have.property('password');
      expect(resposta.body).to.have.property('refreshToken');
      expect(resposta.body).to.have.property('createdAt');
      expect(resposta.body).to.have.property('updatedAt');
    });
  });

  it('Deve atualizar os dados do usuário (PATCH /users/:id)', () => {
    cy.api({
      method: 'PATCH',
      url: `/users/${userId}`,
      headers: {
        'Authorization': `Bearer ${Cypress.env('authToken')}`,
      },
      body: {
        firstName: "Nome Alterado",
        lastName: "Sobrenome Alterado"
      },
    }).then(resposta => {
      expect(resposta.status).to.eq(200);
      expect(resposta.body.firstName).to.eq("Nome Alterado");
      expect(resposta.body.lastName).to.eq("Sobrenome Alterado");
      expect(resposta.body.email).to.eq(userFixture.email);
      expect(resposta.body).to.have.property('password');
      expect(resposta.body).to.have.property('refreshToken');
      expect(resposta.body).to.have.property('createdAt');
      expect(resposta.body).to.have.property('updatedAt');
    });
  });

  it('Deve excluir o usuário (DELETE /users/:id)', () => {
    cy.api({
      method: 'DELETE',
      url: `/users/${userId}`,
      headers: {
        'Authorization': `Bearer ${Cypress.env('authToken')}`
      },
    }).then(resposta => {
      expect(resposta.status).to.eq(200)
      expect(resposta.body.id).to.eq(userId);
      expect(resposta.body.firstName).to.eq("Nome Alterado");
      expect(resposta.body.lastName).to.eq("Sobrenome Alterado");
      expect(resposta.body.email).to.eq(userFixture.email);
      expect(resposta.body).to.have.property('password');
      expect(resposta.body).to.have.property('refreshToken');
      expect(resposta.body).to.have.property('createdAt');
      expect(resposta.body).to.have.property('updatedAt');

      // Verifica se o usuário foi realmente excluído
      cy.api({      
        method: 'GET',
        url: `/users/${userId}`,
        headers: {
          'Authorization': `Bearer ${Cypress.env('authToken')}`
        },
        failOnStatusCode: false,
      }).then(respostaGet => {
        expect(respostaGet.status).to.eq(404);
      });

    });
  });
});
