import { User, PublicUser } from '../types';

const userToPublicUser = (user: User): PublicUser => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...publicUser } = user;
  return publicUser;
};

const unknownToInteger = (value: unknown): number => {
  if (typeof value === 'number') {
    return value;
  }
  if (value instanceof Number) {
    return value.valueOf();
  }
  if (typeof value === 'string') {
    return +value;
  }
  if (value instanceof String) {
    return +(value.valueOf());
  }
  return NaN;
};

export const converters = {
  userToPublicUser, unknownToInteger
};