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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';

export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
  };
}

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(
    @Req() req: AuthenticatedRequest,
    @Body() createProductDto: CreateProductDto,
  ) {
    return this.productsService.create(req.user.userId, createProductDto);
  }

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.productsService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.productsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, req.user.userId, updateProductDto);
  }

  @Delete(':id')
  remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.productsService.remove(id, req.user.userId);
  }

  @Post(':id/images')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadImages(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
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
    const images = await this.productsService.uploadImages(id, req.user.userId, files);
    return {
      message: `${images.length} imagem(ns) enviada(s) com sucesso`,
      images,
    };
  }

  @Delete(':id/images/:imageId')
  deleteImage(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Param('imageId') imageId: string,
  ) {
    return this.productsService.deleteImage(id, req.user.userId, imageId);
  }

  @Patch(':id/images/:imageId')
  @UseInterceptors(FileInterceptor('file'))
  async replaceImage(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Param('imageId') imageId: string,
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
      throw new BadRequestException('O arquivo de imagem é obrigatório para substituição');
    }
    return this.productsService.replaceImage(id, req.user.userId, imageId, file);
  }
}
