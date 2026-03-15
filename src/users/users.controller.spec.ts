import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should create user', async () => {
    mockUsersService.create.mockResolvedValue({ id: '1' });

    const result = await controller.create({
      firstName: 'Rafael',
      lastName: 'Silva',
      email: 'rafael@email.com',
      password: '123456',
    });

    expect(result).toEqual({ id: '1' });
    expect(mockUsersService.create).toHaveBeenCalled();
  });

  it('should return all users', async () => {
    mockUsersService.findAll.mockResolvedValue([{ id: '1' }]);

    const result = await controller.findAll();

    expect(result).toHaveLength(1);
  });

  it('should return one user', async () => {
    mockUsersService.findOne.mockResolvedValue({ id: '1' });

    const result = await controller.findOne('1');

    expect(result.id).toBe('1');
  });

  it('should update user', async () => {
    mockUsersService.update.mockResolvedValue({ id: '1' });

    const result = await controller.update('1', {
      firstName: 'Novo',
    });

    expect(result.id).toBe('1');
  });

  it('should delete user', async () => {
    mockUsersService.remove.mockResolvedValue({ id: '1' });

    const result = await controller.remove('1');

    expect(result.id).toBe('1');
  });
});