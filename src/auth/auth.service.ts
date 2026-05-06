import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from './types/jwt-payload.type';

import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário inválido');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedException('Senha inválida');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken: hashedRefreshToken,
      },
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken);

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.refreshToken) {
        throw new UnauthorizedException();
      }

      const tokenMatch = await bcrypt.compare(refreshToken, user.refreshToken);

      if (!tokenMatch) {
        throw new UnauthorizedException();
      }

      const newAccessToken = this.jwtService.sign(
        {
          sub: user.id,
          email: user.email,
        },
        { expiresIn: '15m' },
      );

      return {
        access_token: newAccessToken,
      };
    } catch {
      throw new UnauthorizedException();
    }
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshToken: null,
      },
    });

    return {
      message: 'Logout realizado com sucesso',
    };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('E-mail não encontrado');
    }

    // Gerar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetCode: code,
        resetCodeExpires: expires,
      },
    });

    console.log(`[RECOVERY] Código para ${email}: ${code}`);
    return { message: 'Código de recuperação enviado para o e-mail' };
  }

  async resetPassword(body: ResetPasswordDto) {
    const { email, code, newPassword } = body;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.resetCode !== code) {
      throw new UnauthorizedException('Código inválido ou e-mail incorreto');
    }

    if (user.resetCodeExpires && user.resetCodeExpires < new Date()) {
      throw new UnauthorizedException('Código expirado');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetCode: null,
        resetCodeExpires: null,
      },
    });

    return { message: 'Senha atualizada com sucesso' };
  }
}
