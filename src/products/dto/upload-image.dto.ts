import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

export class UploadImageDto {
  @ApiProperty({
    description: 'Tipo da imagem: PRODUCT ou LABEL',
    example: 'PRODUCT',
    enum: ['PRODUCT', 'LABEL'],
  })
  @IsString()
  @IsEnum(['PRODUCT', 'LABEL'], {
    message: 'O tipo deve ser PRODUCT ou LABEL',
  })
  type: string;
}
