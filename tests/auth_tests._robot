*** Settings ***
Resource         resources/user_resource.robot
Resource         resources/auth_resource.robot

*** Test Cases ***
Cenario: Sucesso ao realizar login e acessar a rota protegida /auth/me
    [Documentation]    Cria um usuário, faz login e valida se o token permite acessar a rota /me.
    [Teardown]       Rodar Limpeza de Usuario Segura
    
    ${EMAIL}         Set Variable    auth_teste@exemplo.com
    ${SENHA}         Set Variable    SenhaForte123!
    
    # 1. Preparar Usuário (Usando a keyword que você já tem no user_resource)
    ${res_create}=   Criar Usuario    Tester    Auth    ${EMAIL}    ${SENHA}
    ${USER_ID}=      Set Variable    ${res_create.json()}[id]
    Set Suite Variable    ${USER_ID_CRIADO}    ${USER_ID}

    # 2. Tentar Login
    ${res_login}=    Fazer Login    ${EMAIL}    ${SENHA}
    Should Be Equal As Integers    ${res_login.status_code}    201
    Dictionary Should Contain Key  ${res_login.json()}         access_token
    
    # 3. Validar acesso à rota protegida /auth/me
    ${TOKEN}=        Set Variable    ${res_login.json()}[access_token]
    ${HEADERS}=      Create Dictionary    Authorization=Bearer ${TOKEN}
    ${res_me}=       Validar Dados do Usuario Logado    ${HEADERS}
    
    Should Be Equal As Integers    ${res_me.status_code}    200
    Should Be Equal As Strings     ${res_me.json()}[email]    ${EMAIL}

Cenario: Erro ao realizar login com senha inválida
    [Documentation]    Garante que a API retorna 401 e a mensagem correta ao errar a senha.
    [Teardown]       Rodar Limpeza de Usuario Segura

    ${EMAIL}         Set Variable    senha_errada@teste.com
    Criar Usuario    User    Erro    ${EMAIL}    SenhaCorreta123!
    # Pegamos o ID para limpeza mesmo que o login falhe
    Set Suite Variable    ${USER_ID_CRIADO}    ${None} 

    ${res}=          Fazer Login    ${EMAIL}    SenhaErrada321
    Should Be Equal As Integers    ${res.status_code}    401
    Should Be Equal As Strings     ${res.json()}[message]    Senha inválida

Cenario: Erro ao realizar login com usuário não cadastrado
    [Documentation]    Verifica o erro para e-mail não cadastrado no banco.
    
    ${res}=          Fazer Login    nao_existe@teste.com    QualquerSenha123
    Should Be Equal As Integers    ${res.status_code}    401
    Should Be Equal As Strings     ${res.json()}[message]    Usuário inválido