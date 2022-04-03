/* 
 * These functions will validate objects so we can use them in the code later on
 */

import { z, ZodError } from 'zod';
import { User } from '../types/objects';
import { USER_CONSTANTS } from './config';
import { logger } from './logger';

const ZodUser = z.object({
  username: z.string({
    required_error: 'username is required'
  }).min(USER_CONSTANTS.USERNAME_MIN_LENGTH),
  name: z.string({
    required_error: 'name is required'
  }).min(USER_CONSTANTS.NAME_MIN_LENGTH),
  password: z.string({
    required_error: 'password is required'
  }).min(1),
  uid: z.string().uuid().optional()
});


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

export const validators = {
  isUser, userFailure
};
