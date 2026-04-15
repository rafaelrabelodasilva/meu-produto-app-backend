describe('Suíte de testes da camada de categorias (Atômicos)', () => {

  beforeEach(() => {
    // Garante login para todos os testes que precisam de authToken
    cy.login();
  });

  it('Deve criar uma nova categoria (POST /categories)', () => {
    const randomSuffix = Math.floor(Math.random() * 1000000);
    const novaCategoria = { name: `Cat Atômica ${randomSuffix}` };

    cy.api({
      method: 'POST',
      url: '/categories',
      headers: {
        'Authorization': `Bearer ${Cypress.env('authToken')}`,
        'Content-Type': 'application/json'
      },
      body: novaCategoria,
    }).then(resposta => {
      expect(resposta.status).to.eq(201);
      expect(resposta.body).to.have.property('id');
      expect(resposta.body.name).to.eq(novaCategoria.name);
    });
  });

  it('Deve listar as categorias (GET /categories)', () => {
    cy.api({
      method: 'GET',
      url: '/categories',
      headers: {
        'Authorization': `Bearer ${Cypress.env('authToken')}`
      },
    }).then(resposta => {
      expect(resposta.status).to.eq(200);
      expect(resposta.body).to.be.an('array');
    });
  });

  it('Deve atualizar uma categoria (PATCH /categories/:id)', () => {
    cy.criarCategoria().then(categoria => {
      const novoNome = `Cat Alterada ${Math.floor(Math.random() * 1000)}`;
      cy.api({
        method: 'PATCH',
        url: `/categories/${categoria.id}`,
        headers: {
          'Authorization': `Bearer ${Cypress.env('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: { name: novoNome },
      }).then(resposta => {
        expect(resposta.status).to.eq(200);
        expect(resposta.body.name).to.eq(novoNome);
      });
    });
  });

  it('Deve excluir uma categoria (DELETE /categories/:id)', () => {
    cy.criarCategoria().then(categoria => {
      cy.api({
        method: 'DELETE',
        url: `/categories/${categoria.id}`,
        headers: {
          'Authorization': `Bearer ${Cypress.env('authToken')}`
        },
      }).then(resposta => {
        expect(resposta.status).to.be.oneOf([200, 204]);
      });
    });
  });

  it('Deve atribuir e desatribuir categoria a um produto', () => {
    cy.criarCategoria().then(categoria => {
      cy.criarProduto().then(produto => {
        // 1. Atribui
        cy.api({
          method: 'PATCH',
          url: `/products/${produto.id}`,
          headers: {
            'Authorization': `Bearer ${Cypress.env('authToken')}`,
            'Content-Type': 'application/json'
          },
          body: { "categoryId": categoria.id },
        }).then(resAssoc => {
          expect(resAssoc.status).to.be.oneOf([200, 201]);
          
          // 2. Desatribui
          cy.api({
            method: 'PATCH',
            url: `/products/${produto.id}`,
            headers: {
              'Authorization': `Bearer ${Cypress.env('authToken')}`,
              'Content-Type': 'application/json'
            },
            body: { "categoryId": null },
          }).then(resDesassoc => {
            expect(resDesassoc.status).to.be.oneOf([200, 201]);
          });
        });
      });
    });
  });

});
