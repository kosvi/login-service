/*
 * This service handles storing, finding and updating of users inside database
 */

import { v4 as uuidv4 } from 'uuid';
import { PublicUser, User } from '../types';
import { db } from './database';
import { validators } from '../utils/validators';
import { logger } from '../utils/logger';

const hashPassword = (password: string): string => {
  return password.split('').reverse().join('');
};

const addUser = async (username: string, password: string, name: string, email: string): Promise<PublicUser> => {
  // Create user from parameters
  const newUser: User = {
    uid: uuidv4(),
    username: username,
    password: hashPassword(password),
    name: name,
    email: email,
    admin: false,
    locked: false,
    stealth: true
  };
  // if user is valid, store to database and return public version of the user
  // otherwise just throw error and tell where we failed to match requirements for the new user
  if (validators.isUser(newUser)) {
    const success: boolean = await db.addUser(newUser);
    if (success) {
      logger.log('userService - addUser(): new user created');
      return validators.userToPublicUser(newUser);
    } else {
      logger.error('userService - addUser(): database error');
      throw new Error('database error');
    }
  } else {
    logger.debug(`userService - addUser(): invalid user (${validators.userFailure(newUser)})`);
    throw new Error(validators.userFailure(newUser));
  }
};

const findByUsername = async (username: string): Promise<PublicUser | undefined> => {
  const user: PublicUser | undefined = await db.getUser(username);
  return user;
};

const findByUsernameAndPassword = async (username: string, password: string): Promise<PublicUser | undefined> => {
  const user: PublicUser | undefined = await db.getUserByCreds(username, hashPassword(password));
  return user;
};

export const userService = {
  hashPassword, addUser, findByUsername, findByUsernameAndPassword
};
