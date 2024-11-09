//Adicionado dentro da request mais uma variável
//No arquivo tsconfig foi descomentado a linha 34 e adicionado o caminho da criação da nova variável
declare namespace Express{
  export interface Request{
    user_id: string
  }
}