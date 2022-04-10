/* 
 * These functions will validate objects so we can use them in the code later on
 */

import { ZodError } from 'zod';
import { PublicUser, User, ZodUser } from '../types';
import { logger } from './logger';

const isUser = (obj: unknown): obj is User => {
  try {
    ZodUser.parse(obj);
    return true;
  } catch (error) {
    let message = 'parsing user failed';
    if (error instanceof Error) {
      message += `: ${error.message}`;
    }
    logger.error(message);
    return false;
  }
};

const userFailure = (obj: unknown): string | undefined => {
  try {
    ZodUser.parse(obj);
    return undefined;
  } catch (error) {
    if (error instanceof ZodError && error.issues.length > 0) {
      return error.issues[0].message;
    }
    return undefined;
  }
};

const isPublicUser = (obj: unknown): obj is PublicUser => {
  if (obj && typeof obj === 'object' && 'password' in obj) {
    // we have password -> this is not public!
    return false;
  }
  try {
    if (obj && typeof obj === 'object') {
      ZodUser.parse({ password: 'mocked', ...obj });
      return true;
    } else {
      // not even object!
      return false;
    }
  } catch (error) {
    let message = 'parsing user failed';
    if (error instanceof Error) {
      message += `: ${error.message}`;
    }
    logger.error(message);
    return false;
  }
};

const userToPublicUser = (user: User): PublicUser => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...publicUser } = user;
  return publicUser;
};

export const validators = {
  isUser, userFailure, isPublicUser, userToPublicUser
};
