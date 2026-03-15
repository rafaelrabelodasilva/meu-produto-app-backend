import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  create(userId: string, data: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        ...data,
        purchaseDate: data.purchaseDate
          ? new Date(data.purchaseDate)
          : undefined,
        userId,
      },
    });
  }

  findAll(userId: string) {
    return this.prisma.product.findMany({
      where: { userId },
    });
  }

  findOne(id: string, userId: string) {
    return this.prisma.product.findFirst({
      where: { id, userId },
    });
  }

  update(id: string, userId: string, data: UpdateProductDto) {
    return this.prisma.product.update({
      where: { id },
      data: {
        ...data,
        purchaseDate: data.purchaseDate
          ? new Date(data.purchaseDate)
          : undefined,
      },
    });
  }

  async remove(id: string, userId: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.product.delete({
      where: { id },
    });
  }
}
