*** Settings ***
Library    RequestsLibrary
Library    Collections

*** Variables ***
${BASE_URL}       http://localhost:3000
${LOGOUT_ENDPOINT}   /auth/logout
${AUTHME_ENDPOINT}   /auth/me

*** Keywords ***
Acessa rota /auth/me
    [Arguments]    ${headers}
    ${response}=   GET    url=${BASE_URL}${AUTHME_ENDPOINT}    headers=${headers}    expected_status=200
    RETURN    ${response}

Validar Dados do Usuario Logado
    [Arguments]    ${headers}
    ${response}=   GET     url=${BASE_URL}$${AUTHME_ENDPOINT}    headers=${headers}    expected_status=any
    RETURN    ${response}

Faz logout
    [Arguments]    ${headers}
    ${response}=   POST    url=${BASE_URL}${LOGOUT_ENDPOINT}    headers=${headers}    expected_status=201
    RETURN    ${response}