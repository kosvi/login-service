import { User, PublicUser, PublicClient } from '../../../src/types';

const defaultAdmin = {
  username: 'admin',
  password: 'Password!'
};
const validPublicUser: PublicUser = {
  uid: 'af3b325f-06f0-4b25-9fb8-27b07a55cd14',
  username: 'username',
  name: 'full name',
  email: 'user@example.com',
  admin: false,
  locked: false,
  deleted: false
};
const validUser: User = {
  ...validPublicUser,
  password: 'this-is-some-hashed-string'
};
const validPublicClient: PublicClient = {
  id: '06978f0f-58a6-481b-9033-2ced35107b52',
  name: 'FooClient',
  redirect_uri: 'https://foo.example.com/callback',
  allow_write: false
};

export const testData = {
  defaultAdmin, validPublicUser, validUser, validPublicClient
};