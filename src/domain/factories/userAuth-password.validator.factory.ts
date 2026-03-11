import { Validator } from '../shared/validators/validator.js';
import { UserAuthPasswordZodValidator } from '../validators/userAuth-password.zod.validator.js';

export class UserAuthPasswordValidatorFactory {
  public static create(): Validator<string> {
    return UserAuthPasswordZodValidator.create();
  }
}
