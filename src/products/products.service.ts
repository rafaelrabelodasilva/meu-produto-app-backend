import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

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
      include: { images: true },
    });
  }

  findOne(id: string, userId: string) {
    return this.prisma.product.findFirst({
      where: { id, userId },
      include: { images: true },
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
      include: { images: true },
    });
  }

  async remove(id: string, userId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, userId },
      include: { images: true },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    // Capture image paths before deletion
    const imagePaths = product.images.map((img) => img.url);

    const deleted = await this.prisma.product.delete({
      where: { id },
    });

    // Physical file cleanup
    for (const path of imagePaths) {
      await this.storageService.deleteFile(path);
    }

    return deleted;
  }

  async uploadImages(productId: string, userId: string, files: Express.Multer.File[]) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, userId },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    const uploadPromises = files.map(async (file) => {
      const url = await this.storageService.uploadFile(file, `products/${productId}`);
      return this.prisma.productImage.create({
        data: {
          url,
          productId,
        },
      });
    });

    return Promise.all(uploadPromises);
  }

  async deleteImage(productId: string, userId: string, imageId: string) {
    const image = await this.prisma.productImage.findFirst({
      where: {
        id: imageId,
        productId,
        product: { userId },
      },
    });

    if (!image) {
      throw new NotFoundException(`Imagem com ID ${imageId} não encontrada para este produto`);
    }

    await this.prisma.productImage.delete({
      where: { id: imageId },
    });

    await this.storageService.deleteFile(image.url);

    return {
      message: 'Imagem do produto excluída com sucesso',
      id: imageId,
    };
  }

  async replaceImage(productId: string, userId: string, imageId: string, file: Express.Multer.File) {
    const image = await this.prisma.productImage.findFirst({
      where: {
        id: imageId,
        productId,
        product: { userId },
      },
    });

    if (!image) {
      throw new NotFoundException(`Imagem com ID ${imageId} não encontrada para este produto`);
    }

    const oldUrl = image.url;
    const newUrl = await this.storageService.uploadFile(file, `products/${productId}`);

    const updated = await this.prisma.productImage.update({
      where: { id: imageId },
      data: { url: newUrl },
    });

    await this.storageService.deleteFile(oldUrl);

    return {
      message: 'Imagem do produto substituída com sucesso',
      image: updated,
    };
  }
}
