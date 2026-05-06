import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsDateString,
  IsNumber,
  ValidateIf,
  IsEnum,
} from 'class-validator';

export enum ProductType {
  MAIN = 'MAIN',
  ACCESSORY = 'ACCESSORY',
}

export class CreateProductDto {
  @ApiProperty({ description: 'Nome do produto', example: 'iPhone 15 Pro' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Marca do produto', example: 'Apple' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({
    description: 'Modelo do produto',
    example: '128GB Titanium',
  })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({
    description: 'Tamanho ou dimensões',
    example: '6.1 polegadas',
  })
  @IsOptional()
  @IsString()
  size?: string;

  @ApiPropertyOptional({
    description: 'Data da compra',
    example: '2024-01-15T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @ApiPropertyOptional({ description: 'Preço pago', example: 7500.0 })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional({
    description: 'Observações adicionais',
    example: 'Comprado na iPlace',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Tipo do produto: MAIN ou ACCESSORY',
    example: 'MAIN',
    enum: ProductType,
  })
  @IsEnum(ProductType)
  type: ProductType;

  @ApiPropertyOptional({
    description: 'ID da categoria do produto',
    example: 'uuid-da-categoria',
  })
  @IsOptional()
  @ValidateIf((o: CreateProductDto) => o.categoryId !== null)
  @IsString()
  categoryId?: string | null;

  @ApiPropertyOptional({
    description: 'IDs de produtos vinculados (acessórios, complementos)',
    example: ['uuid-produto-1', 'uuid-produto-2'],
    type: [String],
  })
  @IsOptional()
  @IsString({ each: true })
  linkedProductIds?: string[];
}
