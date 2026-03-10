import { Utils } from 'src/shared/utils/utils.js';
import { Entity } from '../entity.js';

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
    const createdAt = new Date();
    const updatedAt = new Date();
    return new UserAuth(id, email, password, createdAt, updatedAt);
  }

  protected validate(): void {}

  public getEmail(): string {
    return this.email;
  }

  public getPassword(): string {
    return this.password;
  }
}
