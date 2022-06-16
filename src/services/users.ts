/*
 * This service handles storing, finding and updating of users inside database
 */

import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { PublicUser, User } from '../types';
import { db } from './database';
import { validators } from '../utils/validators';
import { converters } from '../utils/converters';
import { logger } from '../utils/logger';
import { PASSWORD_REQUIREMENTS } from '../utils/config';
import { mostCommonPasswords } from '../data/mostCommonPasswords';

const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  return hash;
};

const compareHashes = async (password: string, hash: string): Promise<boolean> => {
  const success = await bcrypt.compare(password, hash);
  return success;
};

const addUser = async (username: string, password: string, name: string, email: string): Promise<PublicUser> => {
  const passwordHash = await hashPassword(password);
  // Create user from parameters
  const newUser: User = {
    uid: uuidv4(),
    username: username.toLowerCase(),
    password: passwordHash,
    name: name,
    email: email.toLowerCase(),
    admin: false,
    locked: false,
    stealth: true,
    deleted: false
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
      return converters.userToPublicUser(newUser);
    } else {
      logger.error('userService - addUser(): database error');
      throw new Error('database error');
    }
  } else {
    logger.debug(`userService - addUser(): invalid user (${validators.userFailure(newUser)})`);
    throw new Error(validators.userFailure(newUser));
  }
};

const findUserByUid = async (uid: string): Promise<PublicUser | undefined> => {
  const user: PublicUser | undefined = await db.getUserByUid(uid);
  logger.debug(`userService.findUserByUid() returned: ${user?.username || undefined}`);
  return user;
};

const findByUsername = async (username: string): Promise<PublicUser | undefined> => {
  const user: PublicUser | undefined = await db.getUserByUsername(username);
  return user;
};

const findByUsernameAndPassword = async (username: string, password: string): Promise<PublicUser | undefined> => {
  const user: PublicUser | undefined = await db.getUserByCreds(username, password);
  return user;
};

const updateUser = async (uid: string, password: string, newValues: PublicUser): Promise<PublicUser | undefined> => {
  try {
    if (!uid) {
      return undefined;
    }
    const oldValues = await db.getUserByUidAndPassword(uid, password);
    if (!oldValues) {
      // password failed
      return undefined;
    }
    // use the profile in db as the base and update username, name, email and stealth-mode
    const newUser: PublicUser = {
      ...oldValues,
      username: newValues.username,
      name: newValues.name,
      email: newValues.email,
      stealth: newValues.stealth
    };
    // now validate input 
    if (validators.isPublicUser(newUser)) {
      // given new values are valid
      const success = await db.updateUser(newUser);
      if (success) {
        // updated succesfully
        return newUser;
      }
    }
    // else a failure occurred (username taken? email in use?)
    return undefined;
  } catch (error) {
    logger.debugError('userService.updateUser()', error);
    return undefined;
  }
};

const updatePassword = async (uid: string, oldPassword: string, newPassword: string): Promise<PublicUser | undefined> => {
  // we expect new password has been entered twice & compared before
  try {
    const user = await db.getUserByUidAndPassword(uid, oldPassword);
    // if old password is valid, try updating password. If success -> return true
    if (user) {
      const userWithPassword: User = {
        ...user,
        password: newPassword
      };
      // check new password for validity &6 try to update new one
      if (isValidPassword(newPassword, userWithPassword) && await db.updatePassword(uid, await hashPassword(newPassword))) {
        return user;
      } else {
        // new password was not valid
        // should we throw? ControllerError(?) WhHaAaT?!?
        logger.debug('userService.updatePassword() - new password didn\'t validate');
      }
    }
  } catch (error) {
    logger.debugError('userService.updatePassword()', error);
  }
  return undefined;
};

const deleteUser = async (uid: string): Promise<boolean> => {
  // we expect authorization has been check before
  return await db.deleteUser(uid);
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
  hashPassword, compareHashes, addUser, findUserByUid, findByUsername, findByUsernameAndPassword, updateUser, updatePassword, deleteUser, isValidPassword
};
