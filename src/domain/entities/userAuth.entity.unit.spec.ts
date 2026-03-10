import { UserAuth } from './userAuth.entity.js';

describe('Domain > Entities > UserAuth', () => {
  describe('create', () => {
    it('should create a user when passing valid email and password', () => {
      const anEmail = 'john@doe.com';
      const aPassword = '12345678';

      const anUser = UserAuth.create({ email: anEmail, password: aPassword });

      expect(anUser).toBeInstanceOf(UserAuth);
      expect(anUser.getEmail()).toBe(anEmail);
      expect(anUser.getPassword()).not.toBe(aPassword);
      expect(anUser.comparePassword(aPassword)).toBe(true);
      expect(anUser.getId()).toBeDefined();
      expect(anUser.getId().length).toBe(36);
      expect(anUser.getCreatedAt()).toBeInstanceOf(Date);
      expect(anUser.getUpdatedAt()).toBeInstanceOf(Date);
    });
  });
});
