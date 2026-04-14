// Arquivo de testes para autenticação em Cypress
// Base URL e Endpoints
const BASE_URL = 'http://localhost:3000';
const AUTH_ENDPOINT = '/auth';
const USERS_ENDPOINT = '/users'; // Necessário para criar usuário antes do login

// Função auxiliar para obter token e headers (inspirada em auth_resource.robot e user_resource.robot)
const getAuthHeaders = (email, password) => {
  let token = null;
  let headers = null;

  // Tenta fazer login
  cy.api({
    method: 'POST',
    url: `${BASE_URL}${AUTH_ENDPOINT}/login`,
    body: { email: email, password: password },
    failOnStatusCode: false, // Permite que o teste continue mesmo se o login falhar
  }).then((response) => {
    if (response.status === 201 || response.status === 200) {
      token = response.body.access_token;
      headers = { Authorization: `Bearer \${token}` };
    } else {
      // Se o login falhar, pode ser necessário lidar com diferentes status codes e mensagens de erro
      // Por enquanto, apenas logamos o erro e retornamos null headers
      cy.log(`Falha ao obter token: Status \${response.status}, Body: \${JSON.stringify(response.body)}`);
    }
  });

  // Retorna os headers para uso posterior, pode ser necessário ajustar o fluxo
  // Idealmente, isso seria encapsulado em um beforeEach ou comando customizado do Cypress
  cy.wrap(headers).as('authHeaders'); // Alias para usar em outros comandos
  cy.wrap(token).as('authToken');
};

// Função auxiliar para criar usuário (inspirada em user_resource.robot)
const createUser = (firstName, lastName, email, password) => {
  const userPayload = {
    firstName,
    lastName,
    email,
    password,
  };
  let userId = null;
  
  cy.api({
    method: 'POST',
    url: `${BASE_URL}${USERS_ENDPOINT}`,
    body: userPayload,
    failOnStatusCode: false,
  }).then((response) => {
    if (response.status === 201) {
      userId = response.body.id;
      cy.log(`Usuário criado com sucesso, ID: \${userId}`);
    } else {
      cy.log(`Falha ao criar usuário: Status \${response.status}, Body: \${JSON.stringify(response.body)}`);
    }
  });

  cy.wrap(userId).as('createdUserId'); // Alias para usar em outros comandos
};

// Função auxiliar para limpar usuário (inspirada em user_resource.robot)
const cleanupUser = (userId, authHeaders) => {
  if (userId && authHeaders) {
    cy.api({
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

describe('Auth API Tests', () => {
  let createdUserId = null;
  let authHeaders = null;

  // --- Hooks ---
  beforeEach(function() {
    // Executa antes de cada teste
    // Resetar variáveis antes de cada teste
    createdUserId = null;
    authHeaders = null;
    cy.wrap(null).as('createdUserId'); // Alias para garantir que sempre exista
    cy.wrap(null).as('authHeaders'); // Alias para garantir que sempre exista
  });

  afterEach(function() {
    // Executa após cada teste para limpeza
    // Usa os aliases definidos nos testes para pegar os dados
    cy.get('@createdUserId').then((userId) => {
      cy.get('@authHeaders').then((headers) => {
        // Verifica se temos um ID e headers para limpar
        if (userId && headers) {
          cleanupUser(userId, headers);
        }
      });
    });
  });

  // --- Cenários de Teste ---

  it('Cenario: Sucesso ao realizar login e acessar a rota protegida /auth/me', function() {
    // [Documentation]    Cria um usuário, faz login e valida se o token permite acessar a rota /me.
    
    const EMAIL = 'auth_teste@exemplo.com';
    const SENHA = 'SenhaForte123!';

    // 1. Preparar Usuário
    createUser( 'Tester', 'Auth', EMAIL, SENHA);
    cy.get('@createdUserId').then((userId) => {
      createdUserId = userId; // Armazena o ID para o afterEach
      cy.wrap(userId).as('createdUserId'); // Garante que o alias esteja atualizado
    });

    // 2. Tentar Login
    cy.api({
      method: 'POST',
      url: `${BASE_URL}${AUTH_ENDPOINT}/login`,
      body: { email: EMAIL, password: SENHA },
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property('access_token');
      
      const token = response.body.access_token;
      authHeaders = { Authorization: `Bearer \${token}` };
      cy.wrap(authHeaders).as('authHeaders'); // Garante que o alias esteja atualizado
      cy.wrap(createdUserId).as('createdUserId'); // Garante que o alias esteja atualizado

      // 3. Validar acesso à rota protegida /auth/me
      cy.api({
        method: 'GET',
        url: `${BASE_URL}${AUTH_ENDPOINT}/me`,
        headers: authHeaders,
      }).then((meResponse) => {
        expect(meResponse.status).to.eq(200);
        expect(meResponse.body).to.have.property('email', EMAIL);
      });
    });
  });

  it('Cenario: Erro ao realizar login com senha inválida', function() {
    // [Documentation]    Garante que a API retorna 401 e a mensagem correta ao errar a senha.
    
    const EMAIL = 'senha_errada@teste.com';
    const SENHA_CORRETA = 'SenhaCorreta123!';
    const SENHA_ERRADA = 'SenhaErrada321';

    // Cria o usuário para garantir que o Teardown funcione caso algo dê errado depois
    createUser('User', 'Erro', EMAIL, SENHA_CORRETA);
    cy.get('@createdUserId').then((userId) => {
      createdUserId = userId; // Armazena o ID para o afterEach
      cy.wrap(userId).as('createdUserId');
    });

    // Tentar Login com senha errada
    cy.api({
      method: 'POST',
      url: `${BASE_URL}${AUTH_ENDPOINT}/login`,
      body: { email: EMAIL, password: SENHA_ERRADA },
      failOnStatusCode: false, // Não falhar o teste se o status code não for 2xx
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body).to.have.property('message', 'Senha inválida');
    });
    
    // O createdUserId já foi setado e será limpo pelo afterEach
  });

  it('Cenario: Erro ao realizar login com usuário não cadastrado', () => {
    // [Documentation]    Verifica o erro para e-mail não cadastrado no banco.
    
    const EMAIL_NAO_EXISTE = 'nao_existe@teste.com';
    const SENHA_QUALQUER = 'QualquerSenha123';

    cy.api({
      method: 'POST',
      url: `${BASE_URL}${AUTH_ENDPOINT}/login`,
      body: { email: EMAIL_NAO_EXISTE, password: SENHA_QUALQUER },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body).to.have.property('message', 'Usuário inválido');
    });
    
    // Não há usuário criado para limpar neste cenário.
  });
});
