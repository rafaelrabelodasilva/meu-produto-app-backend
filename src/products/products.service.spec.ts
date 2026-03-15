import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';
import { prismaMock } from '../../test/mocks/prisma.mock';
import { productFactory } from '../../test/factories/product.factory';

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should delete a product', async () => {
    const product = productFactory();

    prismaMock.product.findFirst.mockResolvedValue(product);
    prismaMock.product.delete.mockResolvedValue(product);

    const result = await service.remove(product.id, product.userId);

    expect(result).toEqual(product);
    expect(prismaMock.product.delete).toHaveBeenCalled();
  });
});
