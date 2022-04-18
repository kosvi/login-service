import { User, PublicUser } from '../../../src/types';

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

export const testData = {
  validPublicUser, validUser
};