*** Settings ***
Library    RequestsLibrary
Library    Collections

*** Variables ***
${BASE_URL}      http://localhost:3000
${USER_ENDPOINT}  /users
${USER_ID_CRIADO}        ${None}
${HEADERS_AUTORIZACAO}   ${None}

*** Keywords ***
Criar Usuario
    [Arguments]    ${firstName}    ${lastName}    ${email}    ${password}
    ${payload}=    Create Dictionary    
    ...    firstName=${firstName}    
    ...    lastName=${lastName}    
    ...    email=${email}    
    ...    password=${password}
    
    ${response}=    POST    url=${BASE_URL}${USER_ENDPOINT}    json=${payload}    expected_status=any
    RETURN    ${response}

Obter Token de Acesso
    [Arguments]    ${email}    ${password}
    ${payload}=    Create Dictionary    email=${email}    password=${password}
    # Ajuste o endpoint de login conforme sua implementação de Auth
    ${response}=   POST    url=${BASE_URL}/auth/login    json=${payload}    expected_status=any
    
    IF    ${response.status_code} != 201 and ${response.status_code} != 200
        Fail    Falha ao obter token: ${response.text}
    END

    ${token}=      Set Variable    ${response.json()}[access_token]
    ${headers}=    Create Dictionary    Authorization=Bearer ${token}
    RETURN    ${headers}

Buscar Usuario Por ID
    [Arguments]    ${user_id}    ${headers}
    ${response}=    GET    url=${BASE_URL}${USER_ENDPOINT}/${user_id}    headers=${headers}    expected_status=any
    RETURN    ${response}

Deletar Usuario
    [Arguments]    ${user_id}    ${headers}
    ${response}=    DELETE    url=${BASE_URL}${USER_ENDPOINT}/${user_id}    headers=${headers}    expected_status=any
    RETURN    ${response}

Rodar Limpeza de Usuario Segura
    [Documentation]    Deleta o usuário criado no teste para manter o banco limpo.
    ${status}    ${val}=    Run Keyword And Ignore Error    Variable Should Exist    ${USER_ID_CRIADO}
    IF    '${status}' == 'PASS'
        # Tenta pegar o token se ele ainda não existir para autorizar o delete
        ${headers_status}    ${headers_val}=    Run Keyword And Ignore Error    Variable Should Exist    ${HEADERS_AUTORIZACAO}
        IF    '${headers_status}' == 'PASS'
            Deletar Usuario    ${USER_ID_CRIADO}    ${HEADERS_AUTORIZACAO}
        END
    END