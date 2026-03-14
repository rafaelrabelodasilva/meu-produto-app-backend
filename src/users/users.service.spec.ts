import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { prismaMock } from '../../test/mocks/prisma.mock';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
}));

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  it('should create a user', async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);

    prismaMock.user.create.mockResolvedValue({
      id: '1',
      email: 'rafael@email.com',
    });

    const result = await service.create({
      firstName: 'Rafael',
      lastName: 'Silva',
      email: 'rafael@email.com',
      password: '123456',
    });

    expect(result).toEqual({
      id: '1',
      email: 'rafael@email.com',
    });

    expect(prismaMock.user.create).toHaveBeenCalled();
  });

  it('should throw error if email already exists', async () => {
    prismaMock.user.findFirst.mockResolvedValue({ id: '1' });

    await expect(
      service.create({
        firstName: 'Rafael',
        lastName: 'Silva',
        email: 'rafael@email.com',
        password: '123456',
      }),
    ).rejects.toThrow('E-mail já cadastrado');
  });

  it('should return all users', async () => {
    prismaMock.user.findMany.mockResolvedValue([
      { id: '1', email: 'test@test.com' },
    ]);

    const result = await service.findAll();

    expect(result).toHaveLength(1);
  });

  it('should return one user', async () => {
    prismaMock.user.findFirst.mockResolvedValue({
      id: '1',
      email: 'test@test.com',
    });

    const result = await service.findOne('1');

    expect(result.id).toBe('1');
  });

  it('should throw if user not found', async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);

    await expect(service.findOne('1')).rejects.toThrow(
      'Usuário não encontrado',
    );
  });

  it('should update user', async () => {
    prismaMock.user.findFirst.mockResolvedValue({ id: '1' });

    prismaMock.user.update.mockResolvedValue({
      id: '1',
      firstName: 'Novo',
    });

    const result = await service.update('1', {
      firstName: 'Novo',
    });

    expect(result.firstName).toBe('Novo');
  });

  it('should delete user', async () => {
    prismaMock.user.delete.mockResolvedValue({
      id: '1',
    });

    const result = await service.remove('1');

    expect(result.id).toBe('1');
  });
});
