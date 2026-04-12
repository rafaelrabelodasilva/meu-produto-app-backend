import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'Primeiro nome do usuário', example: 'João' })
  @IsNotEmpty({ message: 'O primeiro nome é obrigatório.' })
  firstName: string;

  @ApiProperty({ description: 'Último nome do usuário', example: 'Silva' })
  @IsNotEmpty({ message: 'O último nome é obrigatório.' })
  lastName: string;

  @ApiProperty({ description: 'E-mail do usuário', example: 'joao@exemplo.com' })
  @IsNotEmpty({ message: 'O e-mail é obrigatório.' })
  @IsEmail({}, { message: 'O email fornecido é inválido.' })
  email: string;

  @ApiProperty({
    description: 'Senha forte do usuário',
    example: 'Senha@123',
    minLength: 8,
  })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'A senha deve ter no mínimo 8 caracteres, incluindo letra maiúscula, minúscula, número e símbolo.',
    },
  )
  password: string;
}
