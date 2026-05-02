import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFamilyDto } from './dto/create-family.dto';
import { FamilyRole } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class FamiliesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createFamilyDto: CreateFamilyDto) {
    return this.prisma.family.create({
      data: {
        name: createFamilyDto.name,
        members: {
          create: {
            userId,
            role: FamilyRole.OWNER,
          },
        },
      },
      include: {
        members: true,
      },
    });
  }

  async generateInviteCode(userId: string, familyId: string) {
    // Verificar se o usuário é OWNER ou ADMIN da família
    const member = await this.prisma.familyMember.findUnique({
      where: {
        userId_familyId: {
          userId,
          familyId,
        },
      },
    });

    if (!member || (member.role !== FamilyRole.OWNER && member.role !== FamilyRole.ADMIN)) {
      throw new ForbiddenException('Apenas proprietários ou administradores podem gerar códigos de convite');
    }

    const inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase(); // 8 caracteres alfanuméricos
    const expires = new Date();
    expires.setDate(expires.getDate() + 7); // Expira em 7 dias

    return this.prisma.family.update({
      where: { id: familyId },
      data: {
        inviteCode,
        inviteCodeExpires: expires,
      },
      select: {
        inviteCode: true,
        inviteCodeExpires: true,
      },
    });
  }

  async join(userId: string, inviteCode: string) {
    const family = await this.prisma.family.findUnique({
      where: { inviteCode },
    });

    if (!family) {
      throw new NotFoundException('Código de convite inválido');
    }

    if (family.inviteCodeExpires && family.inviteCodeExpires < new Date()) {
      throw new BadRequestException('Código de convite expirado');
    }

    // Verificar se o usuário já é membro
    const existingMember = await this.prisma.familyMember.findUnique({
      where: {
        userId_familyId: {
          userId,
          familyId: family.id,
        },
      },
    });

    if (existingMember) {
      throw new BadRequestException('Você já faz parte desta família');
    }

    return this.prisma.familyMember.create({
      data: {
        userId,
        familyId: family.id,
        role: FamilyRole.MEMBER,
      },
      include: {
        family: true,
      },
    });
  }

  async getMyFamilies(userId: string) {
    return this.prisma.familyMember.findMany({
      where: { userId },
      include: {
        family: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async update(userId: string, familyId: string, data: { name: string }) {
    const member = await this.prisma.familyMember.findUnique({
      where: { userId_familyId: { userId, familyId } },
    });

    if (!member || member.role !== FamilyRole.OWNER) {
      throw new ForbiddenException('Apenas o dono pode editar o nome da família');
    }

    return this.prisma.family.update({
      where: { id: familyId },
      data: { name: data.name },
    });
  }

  async removeMember(adminId: string, familyId: string, memberIdToRemove: string) {
    const admin = await this.prisma.familyMember.findUnique({
      where: { userId_familyId: { userId: adminId, familyId } },
    });

    if (!admin || (admin.role !== FamilyRole.OWNER && admin.role !== FamilyRole.ADMIN)) {
      throw new ForbiddenException('Sem permissão para remover membros');
    }

    // Não pode remover o dono
    const targetMember = await this.prisma.familyMember.findFirst({
      where: { userId: memberIdToRemove, familyId },
    });

    if (targetMember?.role === FamilyRole.OWNER) {
      throw new BadRequestException('O dono da família não pode ser removido');
    }

    return this.prisma.familyMember.delete({
      where: { userId_familyId: { userId: memberIdToRemove, familyId } },
    });
  }

  async deleteFamily(userId: string, familyId: string) {
    const member = await this.prisma.familyMember.findUnique({
      where: { userId_familyId: { userId, familyId } },
    });

    if (!member || member.role !== FamilyRole.OWNER) {
      throw new ForbiddenException('Apenas o dono pode excluir a família');
    }

    const memberCount = await this.prisma.familyMember.count({
      where: { familyId },
    });

    if (memberCount > 1) {
      throw new BadRequestException('Remova todos os membros antes de excluir a família');
    }

    // Desvincular produtos da família antes de excluir
    await this.prisma.product.updateMany({
      where: { familyId },
      data: { familyId: null },
    });

    return this.prisma.family.delete({
      where: { id: familyId },
    });
  }
}
