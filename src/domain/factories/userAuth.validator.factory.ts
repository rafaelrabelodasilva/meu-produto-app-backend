import { UserAuth } from '../entities/userAuth.entity.js';
import { Validator } from '../shared/validators/validator.js';
import { UserAuthZodValidator } from '../validators/userAuth.zod.validator.js';

export class UserAuthValidatorFactory {
  public static create(): Validator<UserAuth> {
    return UserAuthZodValidator.create();
  }
}
