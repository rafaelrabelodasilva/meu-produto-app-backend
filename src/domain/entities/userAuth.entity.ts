import { Utils } from 'src/shared/utils/utils.js';
import { Entity } from '../shared/entities/entity.js';
import { UserAuthValidatorFactory } from '../factories/userAuth-validator.factory.js';

export type UserCreateDto = {
  email: string;
  password: string;
};

export class UserAuth extends Entity {
  private constructor(
    id: string,
    private readonly email: string,
    private readonly password: string,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(id, createdAt, updatedAt);
    this.validate();
  }

  public static create({ email, password }: UserCreateDto): UserAuth {
    const id = Utils.generateUUID();
    const hashedPassword = Utils.encryptPassword(password);
    const createdAt = new Date();
    const updatedAt = new Date();
    return new UserAuth(id, email, hashedPassword, createdAt, updatedAt);
  }

  protected validate(): void {
    UserAuthValidatorFactory.create().validate(this);
  }

  public getEmail(): string {
    return this.email;
  }

  public getPassword(): string {
    return this.password;
  }

  public comparePassword(aPassword: string): boolean {
    return Utils.comparePassword(aPassword, this.password);
  }
}
