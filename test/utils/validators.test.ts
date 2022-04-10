import { PublicUser, User } from '../../src/types';
import { v4 as uuidv4 } from 'uuid';
import { validators } from '../../src/utils/validators';

const validPublicUser: PublicUser = {
  username: 'username',
  name: 'full name',
  email: 'user@example.com',
  admin: false,
  locked: false,
  stealth: false
};
const validUser: User = {
  ...validPublicUser,
  password: 'this-is-some-hashed-string',
};


describe('validator tests', () => {

  it('should validate valid Users', () => {
    const validUserWithoutUid: User = validUser;
    expect(validators.isUser(validUserWithoutUid)).toBe(true);
    const validUserWithUid: User = {
      ...validUserWithoutUid,
      uid: uuidv4()
    };
    expect(validators.isUser(validUserWithUid)).toBe(true);
  });

  it('shouldn\'t validate invalid Users', () => {
    const invalidUserWithoutPassword: Omit<User, 'password'> = validPublicUser;
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

  it('shouldn\'t validate user with password as public user', () => {
    expect(validators.isPublicUser(validUser)).toBe(false);
  });

  // This is important so that our API will not accidentally leak more information then it's supposed to!
  it('shouldn\'t validate users with extra attributes as valid', () => {
    const userWithExtras = {
      ...validUser,
      extraProperty: 'extra value'
    };
    expect(validators.isUser(userWithExtras)).toBe(false);
    const publicUserWithExtras = {
      ...validPublicUser,
      extraProperty: 'extra value'
    };
    expect(validators.isPublicUser(publicUserWithExtras)).toBe(false);
  });

  it('should be able to make publicUser from User', () => {
    expect(validators.isPublicUser(validUser)).toBe(false);
    const newPublicUser = validators.userToPublicUser(validUser);
    expect(validators.isPublicUser(newPublicUser)).toBe(true);
    // newPublicUser should be exact the same as original, but only misses password
    expect({ ...newPublicUser, password: validUser.password }).toEqual(validUser);
  });

});