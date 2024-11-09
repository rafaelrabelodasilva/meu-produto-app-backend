import prismaClient from "../../prisma"


interface UserRequest {
  firstName: string
  lastName: string
  email: string
  password: string
}

class CreateUserService {
  async execute({
    firstName, lastName, email, password 
  }: UserRequest){

    if(!email) {
      throw new Error("E-mail incorreto.")
    }

    const userAlreadyExists = await prismaClient.user.findFirst({
      where: {
        email: email
      }
    })

    if(userAlreadyExists) {
      throw new Error("Usuário já cadastrado.")
    }

    const user = await prismaClient.user.create({
      data: {
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password 
      }, 
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true
      }
    })

    return user
  }
}

export { CreateUserService }