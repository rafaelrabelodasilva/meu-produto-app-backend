import { hash } from "bcryptjs";
import prismaClient from "../../prisma";

interface UpdateUserRequest {
  userId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
}

class UpdateUserService {
  async execute({
    userId, firstName, lastName, email, password,
  }: UpdateUserRequest) {
    
    if (!userId) {
      throw new Error("Informe o Id do usuário.");
    }

    const user = await prismaClient.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("Usuário não encontrado.");
    }

    if (!firstName && !lastName && !email && !password){
      throw new Error("É necessário informar ao menos um dado para atualizar o usuário.")
    }

    const updatedUser = await prismaClient.user.update({
      where: { id: userId },
      data: {
        first_name: firstName ?? user.first_name,
        last_name: lastName ?? user.last_name,
        email: email ?? user.email,
        password: password ? await hash(password, 8) : user.password,
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
      },
    });

    return updatedUser
  }
}

export { UpdateUserService }
