import { User, PublicUser } from '../../../src/types';

const validPublicUser: PublicUser = {
  uid: 'af3b325f-06f0-4b25-9fb8-27b07a55cd14',
  username: 'username',
  name: 'full name',
  email: 'user@example.com',
  admin: false,
  locked: false,
  stealth: false,
  deleted: false
};
const validUser: User = {
  ...validPublicUser,
  password: 'this-is-some-hashed-string'
};

export const testData = {
  validPublicUser, validUser
};