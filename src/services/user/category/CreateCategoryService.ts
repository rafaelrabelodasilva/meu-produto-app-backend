import prismaClient from '../../../prisma';

interface CategoryRequest {
  name: string;
  userId: string;
}

class CreateCategoryService {
  async execute({ name, userId }: CategoryRequest) {
    if (name === '') {
      throw new Error('Name invalid');
    }
    const category = await prismaClient.category.create({
      data: {
        name: name,
        userId: userId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    return category;
  }
}

export { CreateCategoryService };
