describe('Suíte de testes da camada de produtos', () => {

  beforeEach(() => {
    // Garante login para obter authToken
    cy.login();
  });

  it('Deve criar um novo produto (POST /products)', () => {
    const randomSuffix = Math.floor(Math.random() * 1000000);
    const novoProduto = {
      name: `Produto Atômico ${randomSuffix}`,
      brand: "Apple",
      model: "PRO M4",
      size: "11",
      purchaseDate: "2025-03-10",
      price: 6500.99,
      notes: "Comprei na Shopee"
    };

    cy.api({
      method: 'POST',
      url: '/products',
      headers: {
        'Authorization': `Bearer ${Cypress.env('authToken')}`,
        'Content-Type': 'application/json'
      },
      body: novoProduto,
    }).then(resposta => {
      expect(resposta.status).to.eq(201);
      expect(resposta.body).to.have.property('id');
      expect(resposta.body.name).to.eq(novoProduto.name);
    });
  });

  it('Deve listar os produtos (GET /products)', () => {
    cy.api({
      method: 'GET',
      url: '/products',
      headers: {
        'Authorization': `Bearer ${Cypress.env('authToken')}`
      },
    }).then(resposta => {
      expect(resposta.status).to.eq(200);
      expect(resposta.body).to.have.property('data');
      expect(resposta.body.data).to.be.an('array');
    });
  });

  it('Deve obter detalhes de um produto (GET /products/:id)', () => {
    cy.criarProduto().then(produto => {
      cy.api({
        method: 'GET',
        url: `/products/${produto.id}`,
        headers: {
          'Authorization': `Bearer ${Cypress.env('authToken')}`
        },
      }).then(resposta => {
        expect(resposta.status).to.eq(200);
        expect(resposta.body.id).to.eq(produto.id);
        expect(resposta.body.name).to.eq(produto.name);
      });
    });
  });

  it('Deve atualizar um produto (PATCH /products/:id)', () => {
    cy.criarProduto().then(produto => {
      const novoNome = `Produto Alterado ${Math.floor(Math.random() * 1000)}`;
      cy.api({
        method: 'PATCH',
        url: `/products/${produto.id}`,
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

  it('Deve excluir um produto (DELETE /products/:id)', () => {
    cy.criarProduto().then(produto => {
      cy.api({
        method: 'DELETE',
        url: `/products/${produto.id}`,
        headers: {
          'Authorization': `Bearer ${Cypress.env('authToken')}`
        },
      }).then(resposta => {
        expect(resposta.status).to.be.oneOf([200, 204]);
      });
    });
  });

  it('Deve listar produtos com paginação', () => {
    cy.api({
      method: 'GET',
      url: '/products?page=1&limit=2',
      headers: {
        'Authorization': `Bearer ${Cypress.env('authToken')}`
      },
    }).then(resposta => {
      expect(resposta.status).to.eq(200);
      expect(resposta.body).to.have.property('meta');
    });
  });

});
