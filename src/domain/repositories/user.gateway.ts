import { UserAuth } from '../entities/userAuth.entity.js';

export interface UserGateway {
  findByEmail(email: string): Promise<UserAuth | null>;
  findById(id: string): Promise<UserAuth | null>;
  create(user: UserAuth): Promise<void>;
}
