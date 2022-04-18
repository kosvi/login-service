import { User, PublicUser } from '../types';

const userToPublicUser = (user: User): PublicUser => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...publicUser } = user;
  return publicUser;
};

export const converters = {
  userToPublicUser
};