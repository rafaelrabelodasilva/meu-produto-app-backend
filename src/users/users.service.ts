import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { prisma } from '../../lib/prisma.js';

@Injectable()
export class UsersService {
  async create(createUserDto: CreateUserDto) {
    const user = await prisma.user.findFirst({
      where: { email: createUserDto.email },
    });
    if (user) {
      throw new HttpException('E-mail já cadastrado', HttpStatus.BAD_REQUEST);
    }
    return await prisma.user.create({
      data: { ...createUserDto },
    });
  }

  async findAll() {
    return await prisma.user.findMany();
  }

  async findOne(id: string) {
    const user = await prisma.user.findFirst({
      where: { id },
    });
    if (!user) {
      throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await prisma.user.findFirst({
      where: { id },
    });
    if (!user) {
      throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
    }
    return await prisma.user.update({
      where: { id },
      data: { ...updateUserDto },
    });
  }

  async remove(id: string) {
    try {
      return await prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Usuário ${id} não encontrado`);
      }
      // Para outros erros
      throw error;
    }
  }
}
