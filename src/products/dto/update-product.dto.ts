import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiPropertyOptional({ description: 'ID da categoria do produto (pode ser null)', example: null, nullable: true })
  @IsOptional()
  @IsString()
  categoryId?: string;
}
