describe('Suíte de testes da camada de usuários (Atômicos)', () => {

  it('Deve criar um novo usuário (POST /users)', () => {
    const randomSuffix = Math.floor(Math.random() * 1000000);
    const novoUsuario = {
      firstName: "Usuario",
      lastName: "Atômico",
      email: `atomico_${randomSuffix}@email.com`,
      password: "Teste@1234"
    };

    cy.api({
      method: 'POST',
      url: '/users',
      body: novoUsuario,
    }).then(resposta => {
      expect(resposta.status).to.eq(201);
      expect(resposta.body).to.have.property('id');
      expect(resposta.body.email).to.eq(novoUsuario.email);
    });
  });

  it('Deve listar os usuários (GET /users)', () => {
    // Basta um token válido (usuário de automação padrão)
    cy.login(); 
    cy.api({
      method: 'GET',
      url: '/users',
      headers: {
        'Authorization': `Bearer ${Cypress.env('authToken')}`
      },
    }).then(resposta => {
      expect(resposta.status).to.eq(200);
      expect(resposta.body).to.be.an('array');
    });
  });

  it('Deve obter detalhes de um usuário específico (GET /users/:id)', () => {
    cy.login();
    cy.criarUsuario().then(usuario => {
      cy.api({
        method: 'GET',
        url: `/users/${usuario.id}`,
        headers: {
          'Authorization': `Bearer ${Cypress.env('authToken')}`
        },
      }).then(resposta => {
        expect(resposta.status).to.eq(200);
        expect(resposta.body.id).to.eq(usuario.id);
        expect(resposta.body.email).to.eq(usuario.email);
      });
    });
  });

  it('Deve atualizar os dados de um usuário (PATCH /users/:id)', () => {
    cy.login();
    cy.criarUsuario().then(usuario => {
      cy.api({
        method: 'PATCH',
        url: `/users/${usuario.id}`,
        headers: {
          'Authorization': `Bearer ${Cypress.env('authToken')}`,
        },
        body: {
          firstName: "Nome Alterado",
          lastName: "Atômico Silva"
        },
      }).then(resposta => {
        expect(resposta.status).to.eq(200);
        expect(resposta.body.firstName).to.eq("Nome Alterado");
      });
    });
  });

  it('Deve excluir um usuário (DELETE /users/:id)', () => {
    cy.login();
    cy.criarUsuario().then(usuario => {
      cy.api({
        method: 'DELETE',
        url: `/users/${usuario.id}`,
        headers: {
          'Authorization': `Bearer ${Cypress.env('authToken')}`
        },
      }).then(resposta => {
        expect(resposta.status).to.be.oneOf([200, 204]);
        
        // Verifica exclusão
        cy.api({      
          method: 'GET',
          url: `/users/${usuario.id}`,
          headers: {
            'Authorization': `Bearer ${Cypress.env('authToken')}`
          },
          failOnStatusCode: false,
        }).then(resGet => {
          expect(resGet.status).to.eq(404);
        });
      });
    });
  });

  it('Deve realizar login com um novo usuário (POST /auth/login)', () => {
    cy.criarUsuario().then(usuario => {
      cy.api({
        method: 'POST',
        url: '/auth/login',
        body: {
          email: usuario.email,
          password: usuario.password
        },
      }).then(resposta => {
        expect(resposta.status).to.be.oneOf([200, 201]);
        expect(resposta.body).to.have.property('access_token');
      });
    });
  });

});
