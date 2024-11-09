import { compare } from "bcryptjs"
import prismaClient from "../../prisma"
import { sign } from "jsonwebtoken"

interface AuthRequest {
  email: string
  password: string
}

class AuthUserService {
  async execute({ email, password }: AuthRequest) {
    const user = await prismaClient.user.findFirst({
      where: {
        email: email
      }
    })

    if (!user) {
      throw new Error("Usuário ou senha incorretos.")
    }

    const passwordMatch = await compare(password, user.password)

    if (!passwordMatch) {
      throw new Error("Usuário ou senha incorretos.")
    }

    const token = sign(
      {
        firstName: user.first_name,
        lastName: user.last_name
      },
      process.env.JWT_SECRET,
      {
        subject: user.id,
        expiresIn: '30d'
      })

    return {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      token: token
    }

  }
}

export { AuthUserService }