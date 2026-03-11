import { ValidatorDomainException } from '../shared/exceptions/validator-domain.exception.js';
import { UserAuth } from './userAuth.entity.js';

describe('Domain > Entities > UserAuth', () => {
  describe('create', () => {
    it('should create a user when passing valid email and password', () => {
      //Arrange
      const anEmail = 'john@doe.com';
      const aPassword = '12345678';

      //Act
      const anUser = UserAuth.create({ email: anEmail, password: aPassword });

      //Assert
      expect(anUser).toBeInstanceOf(UserAuth);
      expect(anUser.getEmail()).toBe(anEmail);
      expect(anUser.getPassword()).not.toBe(aPassword);
      expect(anUser.comparePassword(aPassword)).toBe(true);
      expect(anUser.getId()).toBeDefined();
      expect(anUser.getId().length).toBe(36);
      expect(anUser.getCreatedAt()).toBeInstanceOf(Date);
      expect(anUser.getUpdatedAt()).toBeInstanceOf(Date);
    });

    it('should throw an error when passing invalid email', () => {
      const anInvalidEmail = 'invalid-email';
      const aPassword = '12345678';

      const anError = () => {
        UserAuth.create({ email: anInvalidEmail, password: aPassword });
      };

      expect(anError).toThrow(ValidatorDomainException);
    });

    it('should throw an error when passing invalid password', () => {
      const anEmail = 'john@doe.com';
      const anInvalidPassword = '1234';

      const anError = () => {
        UserAuth.create({ email: anEmail, password: anInvalidPassword });
      };

      expect(anError).toThrow(ValidatorDomainException);
    });
  });

  describe('comparePassword', () => {
    it('should return true when the informed password matches with user password', () => {
      const anEmail = 'john@doe.com';
      const aPassword = '12345678';

      const anUser = UserAuth.create({ email: anEmail, password: aPassword });

      // Garante que a senha está criptografada antes de comparar
      expect(anUser.getPassword()).not.toBe(aPassword);

      const isPasswordCorrect = anUser.comparePassword(aPassword);

      expect(isPasswordCorrect).toBe(true);
    });

    it('should return false when the informed password does not match with user password', () => {
      const anEmail = 'john@doe.com';
      const aPassword = '12345678';

      const anUser = UserAuth.create({ email: anEmail, password: aPassword });

      expect(anUser.getPassword()).not.toBe(aPassword);

      const isPasswordCorrect = anUser.comparePassword('wrong-password');

      expect(isPasswordCorrect).toBe(false);
    });
  });
});
