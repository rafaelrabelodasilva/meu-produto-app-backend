// Arquivo de testes para usuários em Cypress
// Base URL e Endpoints
const BASE_URL = 'http://localhost:3000';
const USERS_ENDPOINT = '/users';
const AUTH_ENDPOINT = '/auth';

// Função auxiliar para criar usuário (inspirada em user_resource.robot)
const createUser = (firstName, lastName, email, password) => {
  const userPayload = {
    firstName,
    lastName,
    email,
    password,
  };
  let userId = null;
  
  cy.request({
    method: 'POST',
    url: `${BASE_URL}${USERS_ENDPOINT}`,
    body: userPayload,
    failOnStatusCode: false, // Permite que o teste continue mesmo se a criação falhar
  }).then((response) => {
    if (response.status === 201) {
      userId = response.body.id;
      cy.log(`Usuário criado com sucesso, ID: \${userId}`);
    } else {
      cy.log(`Falha ao criar usuário: Status \${response.status}, Body: \${JSON.stringify(response.body)}`);
    }
  });

  // Usamos cy.wrap para poder usar o ID em outras chamadas Cypress ou em beforeEach/afterEach
  cy.wrap(userId).as('createdUserId');
};

// Função auxiliar para obter token de acesso (necessário para algumas operações de usuário, como busca e delete)
const getAuthHeaders = (email, password) => {
  let headers = null;
  
  cy.request({
    method: 'POST',
    url: `${BASE_URL}${AUTH_ENDPOINT}/login`,
    body: { email: email, password: password },
    failOnStatusCode: false,
  }).then((response) => {
    if (response.status === 201 || response.status === 200) {
      const token = response.body.access_token;
      headers = { Authorization: `Bearer \${token}` };
    } else {
      cy.log(`Falha ao obter token para headers: Status \${response.status}, Body: \${JSON.stringify(response.body)}`);
    }
  });

  cy.wrap(headers).as('authHeaders'); // Alias para usar em outros comandos
};

// Função auxiliar para deletar usuário (inspirada em user_resource.robot)
const deleteUser = (userId, authHeaders) => {
  if (userId && authHeaders) {
    cy.request({
      method: 'DELETE',
      url: `${BASE_URL}${USERS_ENDPOINT}/${userId}`,
      headers: authHeaders,
      failOnStatusCode: false,
    }).then((response) => {
      if (response.status === 200 || response.status === 204) {
        cy.log(`Usuário ID \${userId} deletado com sucesso.`);
      } else {
        cy.log(`Falha ao deletar usuário ID \${userId}: Status \${response.status}, Body: \${JSON.stringify(response.body)}`);
      }
    });
  }
};

describe('User API Tests', () => {
  let createdUserId = null;
  let authHeaders = null;

  // --- Hooks ---
  // Executa antes de cada teste
  beforeEach(function() {
    // Resetar variáveis para garantir que cada teste seja independente
    createdUserId = null;
    authHeaders = null;
    cy.wrap(null).as('createdUserId'); // Garante que o alias exista
    cy.wrap(null).as('authHeaders'); // Garante que o alias exista
  });

  // Executa após cada teste para limpeza
  afterEach(function() {
    // Utiliza os aliases para obter os dados de ID e headers que podem ter sido definidos nos testes
    cy.get('@createdUserId').then((userId) => {
      cy.get('@authHeaders').then((headers) => {
        // Verifica se temos um ID de usuário e headers de autenticação para poder deletar
        if (userId && headers) {
          deleteUser(userId, headers);
        }
      });
    });
  });

  // --- Cenários de Teste ---

  it('Cenario: Sucesso ao criar e logar um novo usuário', function() {
    // [Documentation]    Cria, loga e deleta o usuario garantindo que o Teardown limpe o banco.
    
    const EMAIL = 'teste_sucesso@exemplo.com';
    const SENHA = 'SenhaForte123!';
    
    // 1. Criar Usuário
    createUser('Robot', 'Framework', EMAIL, SENHA);
    cy.get('@createdUserId').then((userId) => {
      // Armazena o ID criado para ser usado no Teardown e em outros passos deste teste
      createdUserId = userId;
      cy.wrap(userId).as('createdUserId'); // Atualiza alias para o afterEach
    });
    
    // 2. Obter Token de Acesso (necessário para rotas protegidas)
    getAuthHeaders(EMAIL, SENHA);
    cy.get('@authHeaders').then((headers) => {
      authHeaders = headers; // Armazena os headers para uso posterior
      cy.wrap(headers).as('authHeaders'); // Atualiza alias para o afterEach
    });
    
    // 3. Validar Consulta (busca usuário por ID com token)
    cy.get('@createdUserId').then((userId) => { // Pega o ID do usuário criado
      cy.get('@authHeaders').then((headers) => { // Pega os headers de autorização
        cy.request({
          method: 'GET',
          url: `${BASE_URL}${USERS_ENDPOINT}/${userId}`,
          headers: headers,
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property('email', EMAIL);
        });
      });
    });
  });

  it('Cenario: Erro quando a senha não possui os requisitos mínimos', function() {
    // [Documentation]    Verifica se a lista de mensagens do NestJS contém o erro esperado.
    
    const EMAIL = 'erro_senha@teste.com';
    const SENHA_INVALIDA = '123'; // Senha muito curta e sem complexidade

    // Tenta criar usuário com senha inválida
    cy.request({
      method: 'POST',
      url: `${BASE_URL}${USERS_ENDPOINT}`,
      body: {
        firstName: 'Nome',
        lastName: 'Sobrenome',
        email: EMAIL,
        password: SENHA_INVALIDA,
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400);
      
      // Verifica se a resposta contém a lista de mensagens de erro esperada
      expect(response.body).to.have.property('message');
      const messages = response.body.message;
      // A mensagem original do Robot Framework era uma string, aqui esperamos uma lista
      // A mensagem específica de requisito de senha é:
      const expectedPasswordMessage = 'A senha deve ter no mínimo 8 caracteres, incluindo letra maiúscula, minúscula, número e símbolo.';
      expect(messages).to.be.an('array');
      expect(messages).to.include(expectedPasswordMessage);
    });
    
    // Não há usuário criado para limpar neste cenário.
  });

  it('Cenario: Erro ao tentar cadastrar um e-mail já existente', function() {
    // [Documentation]    Tenta cadastrar o mesmo e-mail duas vezes.
    
    const EMAIL_DUPLICADO = 'duplicado@teste.com';
    const SENHA_PADRAO = 'Senha@123456';

    // 1. Criar o primeiro usuário com o e-mail duplicado
    createUser('Primeiro', 'User', EMAIL_DUPLICADO, SENHA_PADRAO);
    cy.get('@createdUserId').then((userId) => {
      createdUserId = userId; // Armazena o ID para o Teardown
      cy.wrap(userId).as('createdUserId');
    });

    // 2. Tentar criar o segundo usuário com o mesmo e-mail
    cy.request({
      method: 'POST',
      url: `${BASE_URL}${USERS_ENDPOINT}`,
      body: {
        firstName: 'Segundo',
        lastName: 'User',
        email: EMAIL_DUPLICADO,
        password: SENHA_PADRAO,
      },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body).to.have.property('message', 'E-mail já cadastrado');
    });
    
    // O createdUserId já foi setado e será limpo pelo afterEach
  });
});
