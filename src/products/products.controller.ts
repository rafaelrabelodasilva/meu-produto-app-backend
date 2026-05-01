// src/products/products.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  UseInterceptors,
  UploadedFiles,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FindAllProductsDto } from './dto/find-all-products.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';

export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
  };
}

@ApiTags('products')
@ApiBearerAuth()
@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo produto' })
  @ApiResponse({ status: 201, description: 'Produto criado com sucesso.' })
  create(
    @Req() req: AuthenticatedRequest,
    @Body() createProductDto: CreateProductDto,
  ) {
    return this.productsService.create(req.user.userId, createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar produtos com busca, paginação e ordenação' })
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query() query: FindAllProductsDto,
  ) {
    return this.productsService.findAll(req.user.userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de um produto específico' })
  findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.productsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um produto' })
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, req.user.userId, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir um produto' })
  async remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    await this.productsService.remove(id, req.user.userId);
    return { message: 'Produto excluído com sucesso.' };
  }

  @Post(':id/images')
  @ApiOperation({ summary: 'Adicionar imagens ao produto' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
        type: {
          type: 'string',
          example: 'PRODUCT',
          description: 'Tipo da imagem: PRODUCT ou LABEL',
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadImages(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body('type') type: string,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5MB
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|webp)' }),
        ],
      }),
    )
    files: Express.Multer.File[],
  ) {
    const images = await this.productsService.uploadImages(
      id,
      req.user.userId,
      files,
      type,
    );
    return {
      message: `${images.length} imagem(ns) enviada(s) com sucesso`,
      images,
    };
  }

  @Delete(':id/images/:imageId')
  @ApiOperation({ summary: 'Excluir uma imagem específica do produto' })
  deleteImage(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Param('imageId') imageId: string,
  ) {
    return this.productsService.deleteImage(id, req.user.userId, imageId);
  }

  @Patch(':id/images/:imageId')
  @ApiOperation({ summary: 'Substituir uma imagem do produto' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        type: { type: 'string', example: 'PRODUCT' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async replaceImage(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Param('imageId') imageId: string,
    @Body('type') type: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5MB
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|webp)' }),
        ],
        fileIsRequired: false,
      }),
    )
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException(
        'O arquivo de imagem é obrigatório para substituição',
      );
    }
    return this.productsService.replaceImage(
      id,
      req.user.userId,
      imageId,
      file,
      type,
    );
  }
}
