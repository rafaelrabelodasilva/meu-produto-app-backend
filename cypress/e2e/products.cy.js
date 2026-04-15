describe('Suíte de testes da camada de produtos', () => {
  let productId;

  before(() => {
    // Realiza login com o usuário padrão de teste
    cy.login("automacao_sistema@email.com", "Teste@1234");
  });

  it('Deve criar um novo produto (POST /products)', () => {
    cy.api({
      method: 'POST',
      url: '/products',
      headers: {
        'Authorization': `Bearer ${Cypress.env('authToken')}`,
        'Content-Type': 'application/json'
      },
      body: {
        "name": "Ipad",
        "brand": "Apple",
        "model": "PRO M4",
        "size": "11",
        "purchaseDate": "2025-03-10",
        "price": 6500.99,
        "notes": "Comprei na Shopee"
      },
    }).then(resposta => {
      expect(resposta.status).to.eq(201);
      expect(resposta.body).to.have.property('id');
      productId = resposta.body.id;
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

  it('Deve obter detalhes do produto criado (GET /products/:id)', () => {
    expect(productId).to.not.be.undefined;
    cy.api({
      method: 'GET',
      url: `/products/${productId}`,
      headers: {
        'Authorization': `Bearer ${Cypress.env('authToken')}`
      },
    }).then(resposta => {
      expect(resposta.status).to.eq(200);
      expect(resposta.body.id).to.eq(productId);
    });
  });

  it('Deve atualizar o produto (PATCH /products/:id)', () => {
    expect(productId).to.not.be.undefined;
    cy.api({
      method: 'PATCH',
      url: `/products/${productId}`,
      headers: {
        'Authorization': `Bearer ${Cypress.env('authToken')}`,
        'Content-Type': 'application/json'
      },
      body: {
        "name": "Iphone",
        "brand": "Apple",
        "model": "13 PRO MAX"
      },
    }).then(resposta => {
      expect(resposta.status).to.eq(200);
      expect(resposta.body.name).to.eq("Iphone");
    });
  });

  it('Deve excluir o produto (DELETE /products/:id)', () => {
    expect(productId).to.not.be.undefined;
    cy.api({
      method: 'DELETE',
      url: `/products/${productId}`,
      headers: {
        'Authorization': `Bearer ${Cypress.env('authToken')}`
      },
    }).then(resposta => {
      expect(resposta.status).to.be.oneOf([200, 204]);
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
