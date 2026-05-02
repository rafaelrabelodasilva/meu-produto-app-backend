import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as Multer from 'multer';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { StorageService } from '../storage/storage.service';
import { FindAllProductsDto } from './dto/find-all-products.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  async create(userId: string, data: CreateProductDto) {
    // Buscar se o usuário pertence a alguma família para associar o produto à família principal
    const familyMember = await this.prisma.familyMember.findFirst({
      where: { userId },
    });

    if (data.categoryId) {
      const category = await this.prisma.category.findFirst({
        where: { 
          id: data.categoryId, 
          OR: [
            { userId },
            { familyId: familyMember?.familyId }
          ]
        },
      });
      if (!category) {
        throw new NotFoundException('Categoria não encontrada.');
      }
    }

    return this.prisma.product.create({
      data: {
        ...data,
        purchaseDate: data.purchaseDate
          ? new Date(data.purchaseDate)
          : undefined,
        userId,
        familyId: familyMember?.familyId, // Associa à família se existir
      },
      include: { category: true },
    });
  }

  async findAll(userId: string, query: FindAllProductsDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const sortBy = query.sortBy || 'createdAt';
    const order = query.order || 'desc';
    const search = query.search;
    const brand = query.brand;
    const categoryId = query.categoryId;

    const skip = (page - 1) * limit;

    // Buscar IDs das famílias das quais o usuário faz parte
    const userFamilies = await this.prisma.familyMember.findMany({
      where: { userId },
      select: { familyId: true },
    });
    const familyIds = userFamilies.map(f => f.familyId);

    // AUTO-SYNC: Se o usuário tiver EXATAMENTE uma família, vincular produtos órfãos a ela
    if (familyIds.length === 1) {
      await this.prisma.product.updateMany({
        where: { userId, familyId: null },
        data: { familyId: familyIds[0] },
      });
      // Sincronizar categorias também
      await this.prisma.category.updateMany({
        where: { userId, familyId: null },
        data: { familyId: familyIds[0] },
      });
    }

    const where: Prisma.ProductWhereInput = {
      OR: [
        { userId }, // Produtos do próprio usuário
        { familyId: { in: familyIds } }, // Produtos das famílias do usuário
      ],
      ...(categoryId && { categoryId }),
      ...(brand && { brand: { contains: brand, mode: 'insensitive' } }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { brand: { contains: search, mode: 'insensitive' } },
          { model: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, items] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        include: { 
          images: true, 
          category: true,
          user: { // Incluir dados do criador
            select: { firstName: true, lastName: true }
          }
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: order } as Prisma.ProductOrderByWithRelationInput,
      }),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId: string) {
    // Buscar famílias do usuário
    const userFamilies = await this.prisma.familyMember.findMany({
      where: { userId },
      select: { familyId: true },
    });
    const familyIds = userFamilies.map(f => f.familyId);

    const product = await this.prisma.product.findFirst({
      where: { 
        id,
        OR: [
          { userId },
          { familyId: { in: familyIds } }
        ]
      },
      include: { 
        images: true, 
        category: true,
        user: { select: { firstName: true, lastName: true } }
      },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    return product;
  }

  async update(id: string, userId: string, data: UpdateProductDto) {
    // Verificar permissão (pertence ao usuário ou à família do usuário)
    const userFamilies = await this.prisma.familyMember.findMany({
      where: { userId },
      select: { familyId: true },
    });
    const familyIds = userFamilies.map(f => f.familyId);

    const product = await this.prisma.product.findFirst({
      where: { 
        id,
        OR: [
          { userId },
          { familyId: { in: familyIds } }
        ]
      },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    if (data.categoryId) {
      const category = await this.prisma.category.findFirst({
        where: { 
          id: data.categoryId,
          OR: [
            { userId },
            { familyId: { in: familyIds } }
          ]
        },
      });
      if (!category) {
        throw new NotFoundException('Categoria não encontrada.');
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        ...data,
        purchaseDate: data.purchaseDate
          ? new Date(data.purchaseDate)
          : undefined,
      },
      include: { images: true, category: true },
    });
  }

  async remove(id: string, userId: string) {
    const userFamilies = await this.prisma.familyMember.findMany({
      where: { userId },
      select: { familyId: true },
    });
    const familyIds = userFamilies.map(f => f.familyId);

    const product = await this.prisma.product.findFirst({
      where: { 
        id,
        OR: [
          { userId },
          { familyId: { in: familyIds } }
        ]
      },
      include: { images: true },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    const imagePaths = product.images.map((img) => img.url);

    const deleted = await this.prisma.product.delete({
      where: { id },
    });

    for (const path of imagePaths) {
      try {
        await this.storageService.deleteFile(path);
      } catch (error) {
        console.error(`Falha ao excluir arquivo físico: ${path}`, error);
      }
    }

    return deleted;
  }

  async uploadImages(
    productId: string,
    userId: string,
    files: Express.Multer.File[],
    type: string = 'PRODUCT',
  ) {
    const userFamilies = await this.prisma.familyMember.findMany({
      where: { userId },
      select: { familyId: true },
    });
    const familyIds = userFamilies.map(f => f.familyId);

    const product = await this.prisma.product.findFirst({
      where: { 
        id: productId,
        OR: [
          { userId },
          { familyId: { in: familyIds } }
        ]
      },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    const uploadPromises = files.map(async (file) => {
      const url = await this.storageService.uploadFile(
        file,
        `products/${productId}`,
      );
      return this.prisma.productImage.create({
        data: {
          url,
          type,
          productId,
        },
      });
    });

    return Promise.all(uploadPromises);
  }

  async deleteImage(productId: string, userId: string, imageId: string) {
    const userFamilies = await this.prisma.familyMember.findMany({
      where: { userId },
      select: { familyId: true },
    });
    const familyIds = userFamilies.map(f => f.familyId);

    const image = await this.prisma.productImage.findFirst({
      where: {
        id: imageId,
        productId,
        product: { 
          OR: [
            { userId },
            { familyId: { in: familyIds } }
          ]
        },
      },
    });

    if (!image) {
      throw new NotFoundException(
        `Imagem com ID ${imageId} não encontrada para este produto`,
      );
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

  async replaceImage(
    productId: string,
    userId: string,
    imageId: string,
    file: Express.Multer.File,
    type?: string,
  ) {
    const userFamilies = await this.prisma.familyMember.findMany({
      where: { userId },
      select: { familyId: true },
    });
    const familyIds = userFamilies.map(f => f.familyId);

    const image = await this.prisma.productImage.findFirst({
      where: {
        id: imageId,
        productId,
        product: { 
          OR: [
            { userId },
            { familyId: { in: familyIds } }
          ]
        },
      },
    });

    if (!image) {
      throw new NotFoundException(
        `Imagem com ID ${imageId} não encontrada para este produto`,
      );
    }

    const oldUrl = image.url;
    const newUrl = await this.storageService.uploadFile(
      file,
      `products/${productId}`,
    );

    const updated = await this.prisma.productImage.update({
      where: { id: imageId },
      data: {
        url: newUrl,
        ...(type && { type }),
      },
    });

    await this.storageService.deleteFile(oldUrl);

    return {
      message: 'Imagem do produto substituída com sucesso',
      image: updated,
    };
  }
}
