import prismaClient from '../../../prisma';

class ListCategoryService {
  async execute(userId: string) {
    const category = await prismaClient.category.findMany({
      where: {
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

export { ListCategoryService };
