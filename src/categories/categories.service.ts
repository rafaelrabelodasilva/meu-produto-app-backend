import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createCategoryDto: CreateCategoryDto) {
    // Verificação manual case-insensitive antes de criar
    const existing = await this.prisma.category.findFirst({
      where: {
        userId,
        name: {
          equals: createCategoryDto.name,
          mode: 'insensitive',
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        'Já existe uma categoria com este nome (mesmo que com letras maiúsculas/minúsculas diferentes).',
      );
    }

    return await this.prisma.category.create({
      data: {
        ...createCategoryDto,
        userId,
      },
    });
  }

  findAll(userId: string) {
    return this.prisma.category.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, userId: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, userId },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada.');
    }

    return category;
  }

  async update(
    id: string,
    userId: string,
    updateCategoryDto: UpdateCategoryDto,
  ) {
    await this.findOne(id, userId);

    if (updateCategoryDto.name) {
      const existing = await this.prisma.category.findFirst({
        where: {
          userId,
          name: {
            equals: updateCategoryDto.name,
            mode: 'insensitive',
          },
          id: { not: id }, // Garante que não é a própria categoria que está sendo editada
        },
      });

      if (existing) {
        throw new ConflictException('Já existe outra categoria com este nome.');
      }
    }

    return await this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    const productsCount = await this.prisma.product.count({
      where: { categoryId: id },
    });

    if (productsCount > 0) {
      throw new ConflictException(
        'Não é possível excluir uma categoria que possui produtos vinculados.',
      );
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }
}
