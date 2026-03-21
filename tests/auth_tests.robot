*** Settings ***
Resource         resources/user_resource.robot
Resource         resources/auth_resource.robot

*** Test Cases ***
Cenario: Sucesso ao autenticar um novo usuário via API
    [Documentation]    Cria, loga, busca, desloga e deleta o usuario
    [Teardown]    Deleta usuario por id

    ${EMAIL}=    Gerar email dinamico
    ${SENHA}=    Set Variable    SenhaForte123!

    ${res}=    Cria usuario    João    Silva    ${EMAIL}    ${SENHA}

    ${USER_ID}=    Get From Dictionary    ${res.json()}    id
    Set Suite Variable    ${USER_ID_CRIADO}    ${USER_ID}

    ${HEADERS}=    Obtem token de acesso    ${EMAIL}    ${SENHA}
    Set Suite Variable    ${HEADERS_AUTORIZACAO}    ${HEADERS}

    ${res_get}=    Busca usuario por id    ${USER_ID_CRIADO}    ${HEADERS_AUTORIZACAO}
    Should Be Equal As Strings    ${res_get.json()}[email]    ${EMAIL}

    ${res}=    Faz logout    ${HEADERS_AUTORIZACAO}

Cenario: Sucesso ao realizar login e acessar a rota protegida /auth/me via API
    [Documentation]    Cria um usuário, faz login e valida se o token permite acessar a rota /me.
    [Teardown]       Deleta usuario por id
    
    ${EMAIL}         Set Variable    teste@example.com
    ${SENHA}         Set Variable    SenhaForte123!
    
    ${res}=    Cria usuario    João    Silva    ${EMAIL}    ${SENHA}

    ${USER_ID}=    Get From Dictionary    ${res.json()}    id
    Set Suite Variable    ${USER_ID_CRIADO}    ${USER_ID}

    ${HEADERS}=    Obtem token de acesso    ${EMAIL}    ${SENHA}
    Set Suite Variable    ${HEADERS_AUTORIZACAO}    ${HEADERS}

    ${res_get}=    Acessa rota /auth/me    ${HEADERS_AUTORIZACAO}
    Should Be Equal As Strings    ${res_get.json()}[email]    ${EMAIL}

Cenario: Falha ao autenticar um usuário com senha incorreta via API
    [Documentation]    Tenta logar com senha incorreta e verifica a resposta de erro
    [Teardown]    Deleta usuario por id

    ${EMAIL}=    Gerar email dinamico
    ${SENHA}=    Set Variable    SenhaForte123!

    ${res}=    Cria usuario    Pedro    Silva    ${EMAIL}    ${SENHA}

    ${USER_ID}=    Get From Dictionary    ${res.json()}    id
    Set Suite Variable    ${USER_ID_CRIADO}    ${USER_ID}

    ${SENHA_INCORRETA}=    Set Variable    SenhaIncorreta123!

    ${res}=    Nao obtem token de acesso    ${EMAIL}    ${SENHA_INCORRETA}

    ${message}=    Get From Dictionary    ${res.json()}    message
    Should Be Equal As Strings    ${message}    Senha inválida

    ${message}=    Get From Dictionary    ${res.json()}    error
    Should Be Equal As Strings    ${message}    Unauthorized

Cenario: Falha ao autenticar um usuário com e-mail incorreto via API
    [Documentation]    Tenta logar com email incorreto e verifica a resposta de erro
    [Teardown]    Deleta usuario por id

    ${EMAIL}=    Gerar email dinamico
    ${SENHA}=    Set Variable    SenhaForte123!

    ${res}=    Cria usuario    Maria    Silva    ${EMAIL}    ${SENHA}

    ${USER_ID}=    Get From Dictionary    ${res.json()}    id
    Set Suite Variable    ${USER_ID_CRIADO}    ${USER_ID}

    ${EMAIL_INCORRETO}=    Set Variable    email@incorreto.com

    ${res}=    Nao obtem token de acesso    ${EMAIL_INCORRETO}    ${SENHA}

    ${message}=    Get From Dictionary    ${res.json()}    message
    Should Be Equal As Strings    ${message}    Usuário inválido

    ${message}=    Get From Dictionary    ${res.json()}    error
    Should Be Equal As Strings    ${message}    Unauthorized