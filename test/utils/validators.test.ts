import { User } from '../../src/types';
import { v4 as uuidv4 } from 'uuid';
import { validators } from '../../src/utils/validators';

describe('validator tests', () => {

  it('should validate valid Users', () => {
    const validUserWithoutUid: User = {
      username: 'username',
      password: 'this-is-some-hashed-string',
      name: 'full name',
      email: 'user@example.net',
      admin: false,
      locked: false,
      stealth: false
    };
    expect(validators.isUser(validUserWithoutUid)).toBe(true);
    const validUserWithUid: User = {
      ...validUserWithoutUid,
      uid: uuidv4()
    };
    expect(validators.isUser(validUserWithUid)).toBe(true);
  });

  it('shouldn\'t validate invalid Users', () => {
    const invalidUserWithoutPassword: Omit<User, 'password'> = {
      username: 'username',
      name: 'full name',
      email: 'user@example.net',
      admin: false,
      locked: false,
      stealth: false
    };
    expect(validators.isUser(invalidUserWithoutPassword)).toBe(false);
    expect(validators.userFailure(invalidUserWithoutPassword)).toBe('password is required');
    const invalidUserWithEmptyPassword: User = {
      ...invalidUserWithoutPassword,
      password: ''
    };
    expect(validators.isUser(invalidUserWithEmptyPassword)).toBe(false);
    expect(validators.userFailure(invalidUserWithEmptyPassword)).toBe('String must contain at least 1 character(s)');
    const invalidUserWithInvalidUid: User = {
      ...invalidUserWithoutPassword,
      password: 'this-is-some-hashed-string',
      uid: 'invalid'
    };
    expect(validators.isUser(invalidUserWithInvalidUid)).toBe(false);
    expect(validators.userFailure(invalidUserWithInvalidUid)).toBe('Invalid uuid');
  });

});