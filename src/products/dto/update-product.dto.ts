import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';
import { IsOptional, IsString, ValidateIf } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiPropertyOptional({
    description: 'ID da categoria do produto (pode ser null)',
    example: null,
    nullable: true,
  })
  @IsOptional()
  @ValidateIf((o) => o.categoryId !== null)
  @IsString()
  categoryId?: string | null;
}
