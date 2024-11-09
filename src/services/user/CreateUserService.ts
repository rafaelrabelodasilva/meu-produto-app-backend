import { hash } from "bcryptjs"
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

    if(!firstName) {
      throw new Error("Informe o primeiro nome.")
    }

    if(!lastName) {
      throw new Error("Informe o sobrenome.")
    }

    if(!email) {
      throw new Error("Informe o e-mail.")
    }

    if(!password) {
      throw new Error("Informe a senha.")
    }

    const userAlreadyExists = await prismaClient.user.findFirst({
      where: {
        email: email
      }
    })

    if(userAlreadyExists) {
      throw new Error("Usuário já cadastrado. Informe outro e-mail")
    }

    const passwordHash = await hash(password, 8)

    const user = await prismaClient.user.create({
      data: {
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: passwordHash 
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