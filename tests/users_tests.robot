*** Settings ***
Resource         resources/user_resource.robot
Library          Collections

*** Test Cases ***
Cenario: Fluxo CRUD Completo com Limpeza Automatica
    [Documentation]    Cria, loga e deleta o usuario garantindo que o Teardown limpe o banco.
    [Teardown]       Rodar Limpeza de Usuario Segura
    
    ${EMAIL}         Set Variable    teste_sucesso@exemplo.com
    ${SENHA}         Set Variable    SenhaForte123!
    
    # 1. Criar Usuário
    ${res}=          Criar Usuario    Robot    Framework    ${EMAIL}    ${SENHA}
    Should Be Equal As Integers    ${res.status_code}    201
    
    # Armazena o ID globalmente para o Teardown poder usar se algo falhar daqui pra frente
    ${USER_ID}=      Set Variable    ${res.json()}[id]
    Set Suite Variable    ${USER_ID_CRIADO}    ${USER_ID}
    
    # 2. Login (Necessário para as rotas protegidas com @UseGuards)
    ${HEADERS}=      Obter Token de Acesso    ${EMAIL}    ${SENHA}
    Set Suite Variable    ${HEADERS_AUTORIZACAO}    ${HEADERS}
    
    # 3. Validar Consulta
    ${res_get}=      Buscar Usuario Por ID    ${USER_ID_CRIADO}    ${HEADERS_AUTORIZACAO}
    Should Be Equal As Integers    ${res_get.status_code}    200
    Should Be Equal As Strings     ${res_get.json()}[email]    ${EMAIL}

Cenario: Validar obrigatoriedade de senha forte
    [Documentation]    Verifica se a lista de mensagens do NestJS contém o erro esperado.
    
    ${res}=          Criar Usuario    Nome    Sobrenome    erro_senha@teste.com    123
    Should Be Equal As Integers    ${res.status_code}    400
    
    # CORREÇÃO AQUI: Acessamos a chave [message] que é uma LISTA e verificamos o valor dentro dela
    ${mensagens}=    Set Variable    ${res.json()}[message]
    List Should Contain Value    ${mensagens}    A senha deve ter no mínimo 8 caracteres, incluindo letra maiúscula, minúscula, número e símbolo.

Cenario: Validar erro de e-mail ja cadastrado
    [Documentation]    Tenta cadastrar o mesmo e-mail duas vezes.
    [Teardown]       Rodar Limpeza de Usuario Segura

    ${EMAIL_DUPLICADO}    Set Variable    duplicado@teste.com
    
    # Criar o primeiro
    ${res1}=         Criar Usuario    Primeiro    User    ${EMAIL_DUPLICADO}    Senha@123456
    ${USER_ID}=      Set Variable    ${res1.json()}[id]
    Set Suite Variable    ${USER_ID_CRIADO}    ${USER_ID}
    
    # Tentar criar o segundo com mesmo e-mail
    ${res2}=         Criar Usuario    Segundo    User    ${EMAIL_DUPLICADO}    Senha@123456
    Should Be Equal As Integers    ${res2.status_code}    400
    Should Be Equal As Strings     ${res2.json()}[message]    E-mail já cadastrado