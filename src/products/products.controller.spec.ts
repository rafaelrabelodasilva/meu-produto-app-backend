import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

import { productFactory } from '../../test/factories/product.factory';
import { productsServiceMock } from '../../test/mocks/products.service.mock';

describe('ProductsController', () => {
  let controller: ProductsController;

  const reqMock = {
    user: {
      userId: '1',
      email: 'test@email.com',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: productsServiceMock,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a product', async () => {
    const product = productFactory();

    productsServiceMock.create.mockResolvedValue(product);

    const result = await controller.create(reqMock as any, {
      name: product.name,
      description: product.description,
      price: product.price,
    });

    expect(productsServiceMock.create).toHaveBeenCalledWith(
      reqMock.user.userId,
      {
        name: product.name,
        description: product.description,
        price: product.price,
      },
    );

    expect(result).toEqual(product);
  });

  it('should return all products', async () => {
    const product = productFactory();

    productsServiceMock.findAll.mockResolvedValue([product]);

    const result = await controller.findAll(reqMock as any);

    expect(productsServiceMock.findAll).toHaveBeenCalledWith(
      reqMock.user.userId,
    );

    expect(result).toEqual([product]);
  });

  it('should return one product', async () => {
    const product = productFactory();

    productsServiceMock.findOne.mockResolvedValue(product);

    const result = await controller.findOne(reqMock as any, product.id);

    expect(productsServiceMock.findOne).toHaveBeenCalledWith(
      product.id,
      reqMock.user.userId,
    );

    expect(result).toEqual(product);
  });

  it('should update a product', async () => {
    const product = productFactory();

    productsServiceMock.update.mockResolvedValue(product);

    const result = await controller.update(
      reqMock as any,
      product.id,
      { name: 'Teclado Gamer' },
    );

    expect(productsServiceMock.update).toHaveBeenCalledWith(
      product.id,
      reqMock.user.userId,
      { name: 'Teclado Gamer' },
    );

    expect(result).toEqual(product);
  });

  it('should delete a product', async () => {
    const product = productFactory();

    productsServiceMock.remove.mockResolvedValue(product);

    const result = await controller.remove(reqMock as any, product.id);

    expect(productsServiceMock.remove).toHaveBeenCalledWith(
      product.id,
      reqMock.user.userId,
    );

    expect(result).toEqual(product);
  });
});
