*** Settings ***
Resource         resources/user_resource.robot
Library          Collections
Library          String

*** Test Cases ***
Cenario: Sucesso ao autenticar um novo usuário
    [Documentation]    Cria, loga, busca, desloga e deleta o usuario
    [Teardown]    Deleta usuario por id

    ${EMAIL}=    Gerar email dinamico
    ${SENHA}=    Set Variable    SenhaForte123!

    ${res}=    Cria usuario    João    Silva    ${EMAIL}    ${SENHA}

    ${USER_ID}=    Get From Dictionary    ${res.json()}    id
    Set Suite Variable    ${USER_ID_CRIADO}    ${USER_ID}

    ${HEADERS}=    Obtem token de acesso    ${EMAIL}    ${SENHA}
    Should Be Equal As Strings    ${res.status_code}    201
    Set Suite Variable    ${HEADERS_AUTORIZACAO}    ${HEADERS}

    ${res_get}=    Busca usuario por id    ${USER_ID_CRIADO}    ${HEADERS_AUTORIZACAO}
    Should Be Equal As Strings    ${res_get.json()}[email]    ${EMAIL}

    ${res}=    Faz logout    ${HEADERS_AUTORIZACAO}

# Cenario: Falha ao autenticar com email incorreto
#     [Documentation]    Tenta logar com email incorreto e verifica a resposta de erro

#     ${EMAIL}=    Gerar email dinamico
#     ${SENHA}=    Set Variable    SenhaForte123!

#     ${res}=    Cria usuario    Maria    Silva    ${EMAIL}    ${SENHA}

#     ${USER_ID}=    Get From Dictionary    ${res.json()}    id
#     Set Suite Variable    ${USER_ID_CRIADO}    ${USER_ID}

#     ${EMAIL_INCORRETO}=    Set Variable    email@incorreto.com

#     ${res}=    Obtem token de acesso    ${EMAIL_INCORRETO}    ${SENHA}
#     Should Be Equal As Strings    ${res.status_code}    401