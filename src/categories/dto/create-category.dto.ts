import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Nome da categoria', example: 'Eletrônicos' })
  @IsNotEmpty({ message: 'O nome da categoria é obrigatório.' })
  @IsString()
  name: string;
}
