import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FamiliesService } from './families.service';
import { CreateFamilyDto } from './dto/create-family.dto';
import { JoinFamilyDto } from './dto/join-family.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthenticatedRequest } from '../products/products.controller';

@ApiTags('families')
@ApiBearerAuth()
@Controller('families')
@UseGuards(JwtAuthGuard)
export class FamiliesController {
  constructor(private readonly familiesService: FamiliesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova família/casa' })
  @ApiResponse({ status: 201, description: 'Família criada com sucesso.' })
  create(
    @Req() req: AuthenticatedRequest,
    @Body() createFamilyDto: CreateFamilyDto,
  ) {
    return this.familiesService.create(req.user.userId, createFamilyDto);
  }

  @Get('my-families')
  @ApiOperation({ summary: 'Listar minhas famílias' })
  getMyFamilies(@Req() req: AuthenticatedRequest) {
    return this.familiesService.getMyFamilies(req.user.userId);
  }

  @Post(':id/invite-code')
  @ApiOperation({ summary: 'Gerar código de convite para a família' })
  generateInviteCode(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.familiesService.generateInviteCode(req.user.userId, id);
  }

  @Post('join')
  @ApiOperation({ summary: 'Entrar em uma família usando um código' })
  join(@Req() req: AuthenticatedRequest, @Body() joinFamilyDto: JoinFamilyDto) {
    return this.familiesService.join(req.user.userId, joinFamilyDto.inviteCode);
  }
}
