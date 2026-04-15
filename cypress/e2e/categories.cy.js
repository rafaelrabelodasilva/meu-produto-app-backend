describe('Suíte de testes da camada de categorias', () => {
  let categoryId;
  let categoryFixture;
  let dynamicCategoryName;
  let dynamicUpdateName;

  before(() => {
    const suffix = Math.floor(Math.random() * 1000000);
    cy.fixture('categories').then((dados) => {
      categoryFixture = dados;
      dynamicCategoryName = `${dados.novaCategoria.name} ${suffix}`;
      dynamicUpdateName = `${dados.categoriaUpdate.name} ${suffix}`;
    });

    // Realiza login com o usuário padrão de teste
    cy.login("automacao_sistema@email.com", "Teste@1234");
  });

  it('Deve criar uma nova categoria (POST /categories)', () => {
    cy.api({
      method: 'POST',
      url: '/categories',
      headers: {
        'Authorization': `Bearer ${Cypress.env('authToken')}`,
        'Content-Type': 'application/json'
      },
      body: { name: dynamicCategoryName },
    }).then(resposta => {
      expect(resposta.status).to.eq(201);
      expect(resposta.body).to.have.property('id');
      expect(resposta.body.name).to.eq(dynamicCategoryName);
      categoryId = resposta.body.id;
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

  it('Deve atualizar a categoria criada (PATCH /categories/:id)', () => {
    expect(categoryId).to.not.be.undefined;
    cy.api({
      method: 'PATCH',
      url: `/categories/${categoryId}`,
      headers: {
        'Authorization': `Bearer ${Cypress.env('authToken')}`,
        'Content-Type': 'application/json'
      },
      body: { name: dynamicUpdateName },
    }).then(resposta => {
      expect(resposta.status).to.eq(200);
      expect(resposta.body.name).to.eq(dynamicUpdateName);
    });
  });

  it('Deve atribuir e depois desatribuir categoria a um produto', () => {
    expect(categoryId).to.not.be.undefined;
    
    // 1. Busca um produto
    cy.api({
      method: 'GET',
      url: '/products',
      headers: { 'Authorization': `Bearer ${Cypress.env('authToken')}` }
    }).then(respostaProdutos => {
      expect(respostaProdutos.status).to.eq(200);
      if (respostaProdutos.body.data.length > 0) {
        const productId = respostaProdutos.body.data[0].id;
        
        // 2. Atribui a categoria
        cy.api({
          method: 'PATCH',
          url: `/products/${productId}`,
          headers: {
            'Authorization': `Bearer ${Cypress.env('authToken')}`,
            'Content-Type': 'application/json'
          },
          body: { "categoryId": categoryId },
        }).then(respostaAssoc => {
          expect(respostaAssoc.status).to.be.oneOf([200, 201]);
          
          // 3. Desatribui a categoria (limpeza para permitir exclusão da categoria)
          cy.api({
            method: 'PATCH',
            url: `/products/${productId}`,
            headers: {
              'Authorization': `Bearer ${Cypress.env('authToken')}`,
              'Content-Type': 'application/json'
            },
            body: { "categoryId": null },
          }).then(respostaDesassoc => {
            expect(respostaDesassoc.status).to.be.oneOf([200, 201]);
          });
        });
      }
    });
  });

  it('Deve excluir a categoria (DELETE /categories/:id)', () => {
    expect(categoryId).to.not.be.undefined;
    cy.api({
      method: 'DELETE',
      url: `/categories/${categoryId}`,
      headers: {
        'Authorization': `Bearer ${Cypress.env('authToken')}`
      },
    }).then(resposta => {
      expect(resposta.status).to.be.oneOf([200, 204]);
    });
  });

});
