*** Settings ***
Resource         resources/user_resource.robot
Library          Collections
Library          String

*** Test Cases ***
Cenario: Sucesso ao cadastrar um novo usuário via API
    [Documentation]    Cria, e deleta o usuario
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

Cenario: Erro ao tentar cadastrar um usuário com e-mail já existente via API
    [Documentation]    Tenta criar um usuário com um e-mail já existente e verifica a resposta de erro
    [Teardown]    Deleta usuario por id

    ${EMAIL}=    Set Variable    duplicado@email.com
    ${SENHA}=    Set Variable    SenhaForte123!

    ${res}=    Cria usuario    Roberta    Silva    ${EMAIL}    ${SENHA}

    ${USER_ID}=    Get From Dictionary    ${res.json()}    id
    Set Suite Variable    ${USER_ID_CRIADO}    ${USER_ID}

    ${res}=    Nao cria usuario    José    Silva    ${EMAIL}    ${SENHA}

    ${message}=    Get From Dictionary    ${res.json()}    message
    Should Be Equal As Strings    ${message}    E-mail já cadastrado

    ${message}=    Get From Dictionary    ${res.json()}    statusCode
    Should Be Equal As Strings    ${message}    400

Cenario: Erro ao tentar cadastrar usuário com senha fraca via API
    [Documentation]    Tenta criar um usuário com uma senha fraca e verifica a resposta de erro

    ${EMAIL}=    Gerar email dinamico
    ${SENHA}=    Set Variable    senha123

    ${res}=    Nao cria usuario    José    Silva    ${EMAIL}    ${SENHA}

    Should Be Equal As Strings
    ...    ${res.json()}[message][0]
    ...    A senha deve ter no mínimo 8 caracteres, incluindo letra maiúscula, minúscula, número e símbolo.

    Should Be Equal As Strings    ${res.json()}[error]    Bad Request
    Should Be Equal As Integers   ${res.json()}[statusCode]    400

Cenario: Sucesso ao editar o cadastro de um usuário via API
    [Documentation]    Cria um usuário, edita seu cadastro e verifica se as alterações foram aplicadas corretamente
    [Teardown]    Deleta usuario por id

    ${PRIMEIRO_NOME}=    Set Variable    João
    ${ULTIMO_NOME}=     Set Variable    Silva
    ${EMAIL}=    Set Variable    joao.silva@email.com
    ${SENHA}=    Set Variable    SenhaForte123!

    ${PRIMEIRO_NOME_EDITADO}=    Set Variable    Roberto
    ${ULTIMO_NOME_EDITADO}=     Set Variable    Souza
    ${EMAIL_EDITADO}=    Set Variable    roberto.souza@email.com
    ${SENHA_EDITADA}=    Set Variable    SenhaAlterada123@

    ${res}=    Cria usuario    ${PRIMEIRO_NOME}    ${ULTIMO_NOME}    ${EMAIL}    ${SENHA}

    ${USER_ID}=    Get From Dictionary    ${res.json()}    id
    Set Suite Variable    ${USER_ID_CRIADO}    ${USER_ID}

    ${HEADERS}=    Obtem token de acesso    ${EMAIL}    ${SENHA}
    Set Suite Variable    ${HEADERS_AUTORIZACAO}    ${HEADERS}

    ${res}=    Edita usuario por id    ${USER_ID_CRIADO}    ${HEADERS_AUTORIZACAO}    ${PRIMEIRO_NOME_EDITADO}    ${ULTIMO_NOME_EDITADO}    ${EMAIL_EDITADO}    ${SENHA_EDITADA}

    ${res_get}=    Busca usuario por id    ${USER_ID_CRIADO}    ${HEADERS_AUTORIZACAO}
    Should Be Equal As Strings    ${res_get.json()}[email]    ${EMAIL_EDITADO}
    Should Be Equal As Strings    ${res_get.json()}[firstName]    ${PRIMEIRO_NOME_EDITADO}
    Should Be Equal As Strings    ${res_get.json()}[lastName]    ${ULTIMO_NOME_EDITADO}
    Should Be Equal As Strings    ${res_get.json()}[password]    ${SENHA_EDITADA}

Cenario: Sucesso ao deletar um usuário via API
    [Documentation]    Cria um usuário, deleta seu cadastro e verifica se a exclusão foi realizada com sucesso
    # [Teardown]    Deleta usuario por id

    ${PRIMEIRO_NOME}=    Set Variable    João
    ${ULTIMO_NOME}=     Set Variable    Silva
    ${EMAIL}=    Gerar email dinamico
    ${SENHA}=    Set Variable    SenhaForte123!

    ${res}=    Cria usuario    ${PRIMEIRO_NOME}    ${ULTIMO_NOME}    ${EMAIL}    ${SENHA}

    ${USER_ID}=    Get From Dictionary    ${res.json()}    id
    Set Suite Variable    ${USER_ID_CRIADO}    ${USER_ID}

    ${HEADERS}=    Obtem token de acesso    ${EMAIL}    ${SENHA}
    Set Suite Variable    ${HEADERS_AUTORIZACAO}    ${HEADERS}

    ${res_get}=    Deleta usuario por id via API    ${USER_ID_CRIADO}    ${HEADERS_AUTORIZACAO}

    ${res}=    Nao busca usuario por id    ${USER_ID_CRIADO}    ${HEADERS_AUTORIZACAO}
    ${message}=    Get From Dictionary    ${res.json()}    message
    Should Be Equal As Strings    ${message}    Usuário não encontrado
