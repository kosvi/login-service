/*
 * This service handles storing, finding and updating of users inside database
 */

import { v4 as uuidv4 } from 'uuid';
import { PublicUser, User } from '../types';
import { db } from './database';
import { validators } from '../utils/validators';
import { logger } from '../utils/logger';
import { PASSWORD_REQUIREMENTS } from '../utils/config';
import { mostCommonPasswords } from '../data/mostCommonPasswords';

const hashPassword = (password: string): string => {
  return password.split('').reverse().join('');
};

const addUser = async (username: string, password: string, name: string, email: string): Promise<PublicUser> => {
  // Create user from parameters
  const newUser: User = {
    uid: uuidv4(),
    username: username.toLowerCase(),
    password: hashPassword(password),
    name: name,
    email: email.toLowerCase(),
    admin: false,
    locked: false,
    stealth: true
  };
  // check to make sure password is strong enough
  if (!isValidPassword(password, newUser)) {
    throw new Error('password not strong enough');
  }
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

const isValidPassword = (password: string, user: User): boolean => {
  if (PASSWORD_REQUIREMENTS.MIN_LENGTH > password.length) {
    return false;
  }
  if (PASSWORD_REQUIREMENTS.BOTH_CASES) {
    if (password === password.toLowerCase() || password === password.toUpperCase()) {
      return false;
    }
  }
  if (PASSWORD_REQUIREMENTS.SPECIAL_CHARACTER) {
    if (!(PASSWORD_REQUIREMENTS.VALID_SPECIAL_CHARACTERS_REGEX.test(password))) {
      return false;
    }
  }
  if (PASSWORD_REQUIREMENTS.NO_EASY) {
    // first check if password contains name, username or email or similar
    if (password.toLowerCase().includes(user.username) || user.email.includes(password.toLowerCase())) {
      return false;
    }
    let easy = false;
    user.name.split(' ').forEach(name => {
      // 3 is just not fail from names like "Da Silva" or "Von Essen" if password contains "da" or "von"
      if (name.length > 3 && password.toLowerCase().includes(name.toLowerCase())) {
        easy = true;
      }
    });
    if (easy) {
      return false;
    }
    // next check for most common password
    for (let i = 0; i < mostCommonPasswords.length; i++) {
      if (mostCommonPasswords[i].toLowerCase() === password.toLowerCase()) {
        return false;
      }
    }
  }
  return true;
};

export const userService = {
  hashPassword, addUser, findByUsername, findByUsernameAndPassword
};
