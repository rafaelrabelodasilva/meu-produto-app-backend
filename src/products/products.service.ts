import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { StorageService } from '../storage/storage.service';
import { FindAllProductsDto } from './dto/find-all-products.dto';
import { Prisma } from '@prisma/client';

interface ProductImage {
  id: string;
  url: string;
  type: string;
  productId: string;
  createdAt: Date;
}

interface ProductWithRelations {
  images: ProductImage[];
  linkedProducts?: { images: ProductImage[] }[];
  linkedBy?: { images: ProductImage[] }[];
  [key: string]: any;
}

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  async create(userId: string, data: CreateProductDto) {
    const familyMember = await this.prisma.familyMember.findFirst({
      where: { userId },
    });

    if (data.categoryId) {
      const category = await this.prisma.category.findFirst({
        where: {
          id: data.categoryId,
          OR: [{ userId }, { familyId: familyMember?.familyId }],
        },
      });
      if (!category) {
        throw new NotFoundException('Categoria não encontrada.');
      }
    }

    const { linkedProductIds, ...productData } = data;

    const product = await this.prisma.product.create({
      data: {
        ...productData,
        type: productData.type || 'MAIN',
        purchaseDate: productData.purchaseDate
          ? new Date(productData.purchaseDate)
          : undefined,
        userId,
        familyId: familyMember?.familyId,
        linkedProducts: linkedProductIds
          ? {
              connect: linkedProductIds.map((id) => ({ id })),
            }
          : undefined,
      },
      include: {
        category: true,
        images: true,
        user: { select: { firstName: true, lastName: true } },
        linkedProducts: {
          include: { images: true, category: true },
        },
      },
    });

    return this.formatProduct(product as unknown as ProductWithRelations);
  }

  async findAll(userId: string, query: FindAllProductsDto) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const sortBy = query.sortBy || 'createdAt';
    const order = query.order || 'desc';
    const search = query.search;
    const brand = query.brand;
    const categoryId = query.categoryId;

    const userFamilies = await this.prisma.familyMember.findMany({
      where: { userId },
      select: { familyId: true },
    });
    const familyIds = userFamilies.map((f) => f.familyId);

    const where: Prisma.ProductWhereInput = {
      OR: [{ userId }, { familyId: { in: familyIds } }],
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
          linkedBy: true, // Adicionado para identificar órfãos
          user: {
            select: { firstName: true, lastName: true },
          },
        },
        orderBy: { [sortBy]: order } as Prisma.ProductOrderByWithRelationInput,
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const formattedItems = items.map((product) =>
      this.formatProduct(product as unknown as ProductWithRelations),
    );

    return {
      data: formattedItems,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId: string) {
    const userFamilies = await this.prisma.familyMember.findMany({
      where: { userId },
      select: { familyId: true },
    });
    const familyIds = userFamilies.map((f) => f.familyId);

    const product = await this.prisma.product.findFirst({
      where: {
        id,
        OR: [{ userId }, { familyId: { in: familyIds } }],
      },
      include: {
        images: true,
        category: true,
        user: { select: { firstName: true, lastName: true } },
        linkedProducts: {
          include: { images: true, category: true },
        },
        linkedBy: {
          include: { images: true, category: true },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    return this.formatProduct(product as unknown as ProductWithRelations);
  }

  private formatProduct(product: ProductWithRelations) {
    if (!product) return null;
    const supabaseUrl = process.env.SUPABASE_URL;
    const bucketName = process.env.SUPABASE_BUCKET || 'meu-produto-images';

    const formatImages = (images: ProductImage[]) =>
      images?.map((img) => ({
        ...img,
        url: img.url.startsWith('http')
          ? img.url
          : `${supabaseUrl}/storage/v1/object/public/${bucketName}/${img.url}`,
      })) || [];

    return {
      ...product,
      images: formatImages(product.images),
      linkedProducts:
        product.linkedProducts?.map((lp) => ({
          ...lp,
          images: formatImages(lp.images),
        })) || [],
      linkedBy:
        product.linkedBy?.map((lb) => ({
          ...lb,
          images: formatImages(lb.images),
        })) || [],
    };
  }

  async update(id: string, userId: string, data: UpdateProductDto) {
    const userFamilies = await this.prisma.familyMember.findMany({
      where: { userId },
      select: { familyId: true },
    });
    const familyIds = userFamilies.map((f) => f.familyId);

    const product = await this.prisma.product.findFirst({
      where: {
        id,
        OR: [{ userId }, { familyId: { in: familyIds } }],
      },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    const { linkedProductIds, ...productData } = data;

    const updated = await this.prisma.product.update({
      where: { id },
      data: {
        ...productData,
        purchaseDate: productData.purchaseDate
          ? new Date(productData.purchaseDate)
          : undefined,
        linkedProducts: linkedProductIds
          ? {
              set: linkedProductIds.map((id) => ({ id })),
            }
          : undefined,
      },
      include: {
        images: true,
        category: true,
        user: { select: { firstName: true, lastName: true } },
        linkedProducts: {
          include: { images: true, category: true },
        },
        linkedBy: {
          include: { images: true, category: true },
        },
      },
    });

    return this.formatProduct(updated as unknown as ProductWithRelations);
  }

  async remove(id: string, userId: string) {
    const userFamilies = await this.prisma.familyMember.findMany({
      where: { userId },
      select: { familyId: true },
    });
    const familyIds = userFamilies.map((f) => f.familyId);

    const product = await this.prisma.product.findFirst({
      where: {
        id,
        OR: [{ userId }, { familyId: { in: familyIds } }],
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
    const familyIds = userFamilies.map((f) => f.familyId);

    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        OR: [{ userId }, { familyId: { in: familyIds } }],
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

    const images = await Promise.all(uploadPromises);
    const supabaseUrl = process.env.SUPABASE_URL;
    const bucketName = process.env.SUPABASE_BUCKET || 'meu-produto-images';

    return images.map((img) => ({
      ...img,
      url: `${supabaseUrl}/storage/v1/object/public/${bucketName}/${img.url}`,
    }));
  }

  async deleteImage(productId: string, userId: string, imageId: string) {
    const userFamilies = await this.prisma.familyMember.findMany({
      where: { userId },
      select: { familyId: true },
    });
    const familyIds = userFamilies.map((f) => f.familyId);

    const image = await this.prisma.productImage.findFirst({
      where: {
        id: imageId,
        productId,
        product: {
          OR: [{ userId }, { familyId: { in: familyIds } }],
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
    const familyIds = userFamilies.map((f) => f.familyId);

    const image = await this.prisma.productImage.findFirst({
      where: {
        id: imageId,
        productId,
        product: {
          OR: [{ userId }, { familyId: { in: familyIds } }],
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
