*** Settings ***
Library    RequestsLibrary
Library    Collections
Library    String

*** Variables ***
${BASE_URL}          http://localhost:3000
${USER_ENDPOINT}     /users
${LOGIN_ENDPOINT}    /auth/login

${USER_ID_CRIADO}        ${NONE}
${HEADERS_AUTORIZACAO}   ${NONE}


*** Keywords ***
Gerar email dinamico
    ${random}=    Generate Random String    8    [LOWER]
    ${email}=     Set Variable    teste_${random}@exemplo.com
    RETURN    ${email}

Cria usuario
    [Arguments]    ${firstName}    ${lastName}    ${email}    ${password}
    ${payload}=    Create Dictionary    
    ...    firstName=${firstName}    
    ...    lastName=${lastName}    
    ...    email=${email}    
    ...    password=${password}
    
    ${response}=    POST    url=${BASE_URL}${USER_ENDPOINT}    json=${payload}    expected_status=201
    RETURN    ${response}

Nao cria usuario
    [Arguments]    ${firstName}    ${lastName}    ${email}    ${password}
    ${payload}=    Create Dictionary    
    ...    firstName=${firstName}    
    ...    lastName=${lastName}    
    ...    email=${email}    
    ...    password=${password}
    
    ${response}=    POST    url=${BASE_URL}${USER_ENDPOINT}    json=${payload}    expected_status=400
    RETURN    ${response}

Obtem token de acesso
    [Arguments]    ${email}    ${password}
    ${payload}=    Create Dictionary    email=${email}    password=${password}
    
    ${response}=   POST    url=${BASE_URL}${LOGIN_ENDPOINT}    json=${payload}    expected_status=201
    
    ${token}=      Set Variable    ${response.json()}[access_token]
    ${headers}=    Create Dictionary    Authorization=Bearer ${token}
    RETURN    ${headers}

Nao obtem token de acesso
    [Arguments]    ${email}    ${password}
    ${payload}=    Create Dictionary    email=${email}    password=${password}
    
    ${response}=   POST    url=${BASE_URL}${LOGIN_ENDPOINT}    json=${payload}    expected_status=401
    RETURN    ${response}

Busca usuario por id
    [Arguments]    ${user_id}    ${headers}
    ${response}=    GET    url=${BASE_URL}${USER_ENDPOINT}/${user_id}    headers=${headers}    expected_status=200
    RETURN    ${response}

Nao busca usuario por id
    [Arguments]    ${user_id}    ${headers}
    ${response}=    GET    url=${BASE_URL}${USER_ENDPOINT}/${user_id}    headers=${headers}    expected_status=404
    RETURN    ${response}

Deleta usuario por id
    ${existe_user}=    Run Keyword And Return Status    Variable Should Exist    ${USER_ID_CRIADO}
    ${existe_header}=  Run Keyword And Return Status    Variable Should Exist    ${HEADERS_AUTORIZACAO}

    Run Keyword If    '${existe_user}'=='True' and '${existe_header}'=='True'    DELETE    url=${BASE_URL}${USER_ENDPOINT}/${USER_ID_CRIADO}    headers=${HEADERS_AUTORIZACAO}    expected_status=200
    ...    ELSE    Log    Usuário ou token de acesso não disponíveis para exclusão.

Edita usuario por id
    [Arguments]    ${user_id}    ${headers}    ${firstName}    ${lastName}    ${email}    ${password}
    ${payload}=    Create Dictionary    
    ...    firstName=${firstName}    
    ...    lastName=${lastName}
    ...    email=${email}
    ...    password=${password}
    
    ${response}=    PATCH    url=${BASE_URL}${USER_ENDPOINT}/${user_id}    headers=${headers}    json=${payload}    expected_status=200
    RETURN    ${response}

Deleta usuario por id via API
    [Arguments]    ${user_id}    ${headers}
    ${response}=    DELETE    url=${BASE_URL}${USER_ENDPOINT}/${user_id}    headers=${headers}    expected_status=200
    RETURN    ${response}
