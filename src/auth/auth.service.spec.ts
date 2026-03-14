import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { prismaMock } from '../../test/mocks/prisma.mock';

jest.mock('bcrypt', () => ({
  compare: jest.fn().mockResolvedValue(true),
  hash: jest.fn().mockResolvedValue('hashedToken'),
}));

describe('AuthService', () => {
  let service: AuthService;

  const jwtServiceMock = {
    sign: jest.fn().mockReturnValue('token'),
    verify: jest.fn().mockReturnValue({
      sub: '1',
      email: 'test@test.com',
    }),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('should login user', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: '1',
      email: 'test@test.com',
      password: 'hashed',
    });

    const result = await service.login('test@test.com', '123');

    expect(result).toHaveProperty('access_token');
    expect(result).toHaveProperty('refresh_token');
  });
});
