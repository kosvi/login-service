import { TokenContent, User } from '../../../src/types';
import { v4 as uuidv4 } from 'uuid';
import { validators } from '../../../src/utils/validators';
import { testData } from './helperData';


describe('validator tests', () => {

  it('should validate valid Users', () => {
    const validUserWithoutUid: User = testData.validUser;
    expect(validators.isUser(validUserWithoutUid)).toBe(true);
    const validUserWithUid: User = {
      ...validUserWithoutUid,
      uid: uuidv4()
    };
    expect(validators.isUser(validUserWithUid)).toBe(true);
  });

  it('shouldn\'t validate invalid Users', () => {
    const invalidUserWithoutPassword: Omit<User, 'password'> = testData.validPublicUser;
    expect(validators.isUser(invalidUserWithoutPassword)).toBe(false);
    expect(validators.userFailure(invalidUserWithoutPassword)).toBe('password is required');
    const invalidUserWithEmptyPassword: User = {
      ...invalidUserWithoutPassword,
      password: '',
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
    expect(validators.isPublicUser(testData.validUser)).toBe(false);
  });

  // This is important so that our API will not accidentally leak more information then it's supposed to!
  it('shouldn\'t validate users with extra attributes as valid', () => {
    const userWithExtras = {
      ...testData.validUser,
      extraProperty: 'extra value'
    };
    expect(validators.isUser(userWithExtras)).toBe(false);
    const publicUserWithExtras = {
      ...testData.validPublicUser,
      extraProperty: 'extra value'
    };
    expect(validators.isPublicUser(publicUserWithExtras)).toBe(false);
  });

  // These are to validate token content
  it('should not validate as token if extra attributes exist', () => {
    const tokenWithExtraContent = {
      uid: testData.validPublicUser.uid,
      username: testData.validPublicUser.username,
      expires: Math.floor(new Date().getTime() / 1000),
      name: testData.validPublicUser.name,
      email: testData.validPublicUser.email,
      iat: Math.floor(new Date().getTime() / 1000)
    };
    expect(validators.isTokenContent(tokenWithExtraContent)).toBe(false);
  });
  it('should validate valid token contents', () => {
    let validTokenContent: TokenContent = {
      uid: testData.validPublicUser.uid as string,
      username: testData.validPublicUser.username,
      expires: Math.floor(new Date().getTime() / 1000),
    };
    expect(validators.isTokenContent(validTokenContent)).toBe(true);
    // Add optional properties
    validTokenContent = {
      ...validTokenContent,
      name: testData.validPublicUser.name,
      email: testData.validPublicUser.email
    };
    expect(validators.isTokenContent(validTokenContent)).toBe(true);
  });

  // These are to validate objects as whitelist-hosts
  it('should validate valid whitehost', () => {
    expect(validators.isWhitehost(testData.validWhitehost)).toBe(true);
  });
  it('shouldn\'t allow extra properties for a whitehost', () => {
    expect(validators.isWhitehost({ ...testData.validWhitehost, extraProperty: 'foobar' })).toBe(false);
  });
  it('shouldn\'t validate objects that miss an property', () => {
    expect(validators.isWhitehost({ id: 1, name: 'foo', host: 'http://foo.example.com' })).toBe(false);
    expect(validators.isWhitehost({ id: 1, name: 'foo', trusted: false })).toBe(false);
    expect(validators.isWhitehost({ id: 1, host: 'http://foo.example.com', trusted: false })).toBe(false);
    expect(validators.isWhitehost({ name: 'foo', host: 'http://foo.example.com', trusted: false })).toBe(false);
  });

});