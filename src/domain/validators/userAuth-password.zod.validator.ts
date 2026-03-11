import { z } from 'zod';
import { Validator } from '../shared/validators/validator.js';
import { ZodUtils } from 'src/shared/utils/zod-utils.js';
import { DomainException } from '../shared/exceptions/domain.exception.js';
import { ValidatorDomainException } from '../shared/exceptions/validator-domain.exception.js';

export class UserAuthPasswordZodValidator implements Validator<string> {
  private constructor() { }

  public static create(): UserAuthPasswordZodValidator {
    return new UserAuthPasswordZodValidator();
  }

  public validate(input: string): void {
    try {
      this.getZodSchema().parse(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = ZodUtils.formatZodError(error);
        throw new ValidatorDomainException(
          `Error while validating user password: ${message}`,
          'Senha inválida',
          UserAuthPasswordZodValidator.name,
        );
      }

      const err = error as Error;
      throw new DomainException(
        `Error while validating user password: ${err.message}`,
        'Houve um erro inesperado ao validar a senha do usuário',
        UserAuthPasswordZodValidator.name,
      );
    }
  }

  private getZodSchema() {
    const zodSchema = z.string().min(8);
    return zodSchema;
  }
}
