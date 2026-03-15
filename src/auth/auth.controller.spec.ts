import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthUser } from './types/auth-user.type';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    login: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should login user', async () => {
    mockAuthService.login.mockResolvedValue({
      access_token: 'token',
      refresh_token: 'refresh',
    });

    const result = await controller.login({
      email: 'test@test.com',
      password: '123456',
    });

    expect(result).toEqual({
      access_token: 'token',
      refresh_token: 'refresh',
    });

    expect(mockAuthService.login).toHaveBeenCalledWith(
      'test@test.com',
      '123456',
    );
  });

  it('should refresh token', async () => {
    mockAuthService.refreshToken.mockResolvedValue({
      access_token: 'newToken',
    });

    const result = await controller.refresh('refreshToken');

    expect(result).toEqual({
      access_token: 'newToken',
    });

    expect(mockAuthService.refreshToken).toHaveBeenCalledWith('refreshToken');
  });

  it('should return current user', () => {
    const user: AuthUser = {
      userId: '1',
      email: 'test@test.com',
    };

    const result = controller.getMe(user);

    expect(result).toEqual(user);
  });

  it('should logout user', () => {
    mockAuthService.logout.mockResolvedValue({
      message: 'Logout realizado com sucesso',
    });

    const user: AuthUser = {
      userId: '1',
      email: 'test@test.com',
    };

    const result = controller.logout(user);

    expect(result).toEqual({
      message: 'Logout realizado com sucesso',
    });

    expect(mockAuthService.logout).toHaveBeenCalledWith('1');
  });
});
