import { z } from 'zod';
import { UserAuth } from '../entities/userAuth.entity.js';
import { Validator } from '../shared/validators/validator.js';
import { ZodUtils } from 'src/shared/utils/zod-utils.js';
import { ValidatorDomainException } from '../shared/exceptions/validator-domain.exception.js';

export class UserAuthZodValidator implements Validator<UserAuth> {
  private constructor() {}

  public static create(): UserAuthZodValidator {
    return new UserAuthZodValidator();
  }

  public validate(input: UserAuth): void {
    try {
      this.getZodSchema().parse(input);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = ZodUtils.formatZodError(error);
        throw new ValidatorDomainException(
          `Error while validating user ${input.getId()}: ${message}`,
          `Os dados para a criação do usuário são inválidos: ${message}`,
          UserAuthZodValidator.name,
        );
      }
    }
  }

  private getZodSchema() {
    const zodSchema = z.object({
      id: z.string().uuid(),
      email: z.string().email(),
      password: z.string().min(8),
      createdAt: z.date(),
      updatedAt: z.date(),
    });

    return zodSchema;
  }
}
