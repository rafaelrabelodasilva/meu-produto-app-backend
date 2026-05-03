import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum OrderBy {
  ASC = 'asc',
  DESC = 'desc',
}

export class FindAllProductsDto {
  @ApiPropertyOptional({
    description: 'Termo de busca (nome, marca ou modelo)',
    example: 'iPhone',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filtrar por marca', example: 'Apple' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ID da categoria',
    example: 'uuid-da-categoria',
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Número da página', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Itens por página',
    default: 50,
    maximum: 1000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  limit?: number = 50;

  @ApiPropertyOptional({
    description: 'Campo para ordenação',
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    enum: OrderBy,
    description: 'Direção da ordenação',
    default: OrderBy.DESC,
  })
  @IsOptional()
  @IsEnum(OrderBy)
  order?: OrderBy = OrderBy.DESC;
}
