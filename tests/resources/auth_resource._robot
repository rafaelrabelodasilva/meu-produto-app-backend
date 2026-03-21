*** Settings ***
Library    RequestsLibrary
Library    Collections

*** Variables ***
${BASE_URL}       http://localhost:3000
${AUTH_ENDPOINT}   /auth

*** Keywords ***
Fazer Login
    [Arguments]    ${email}    ${password}
    ${payload}=    Create Dictionary    email=${email}    password=${password}
    ${response}=   POST    url=${BASE_URL}${AUTH_ENDPOINT}/login    json=${payload}    expected_status=any
    RETURN    ${response}

Validar Dados do Usuario Logado
    [Arguments]    ${headers}
    ${response}=   GET     url=${BASE_URL}${AUTH_ENDPOINT}/me    headers=${headers}    expected_status=any
    RETURN    ${response}