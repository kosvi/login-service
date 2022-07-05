/* 
 * This file contains all the functions needed when accessing users table in the database
 */


import { pool } from './db';
import { PublicUser, User } from '../../types';
import { logger } from '../../utils/logger';
import { validators } from '../../utils/validators';
import { userService } from '../users';
import { converters } from '../../utils/converters';

export const addUser = async (user: User): Promise<boolean> => {
  // Not quite sure if we handle failures properly...
  try {
    logger.db(`INSERT user '${user.username}'`);
    const result = await pool.query(
      'INSERT INTO account (uid, username, password, name, email) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [user.uid, user.username, user.password, user.name, user.email]
    );
    if (result.rowCount === 1) {
      // we don't want to mess around with the password, so let's keep this like this for now
      const publicUser = converters.userToPublicUser(result.rows[0] as User);
      logger.debug(`added user: ${JSON.stringify(publicUser)}`);
      // this should probably be returned instead of boolean!
      return true;
    }
  } catch (error) {
    logger.debugError('db.addUser()', error);
  }
  return false;
};

export const getUserByUid = async (uid: string): Promise<PublicUser | undefined> => {
  try {
    logger.db(`SELECT uid '${uid}'`);
    const result = await pool.query('SELECT uid, username, name, email, admin, locked, stealth, deleted, created_on FROM account WHERE uid = $1', [uid]);
    if (result.rowCount === 1 && validators.isPublicUser(result.rows[0])) {
      return result.rows[0];
    }
    logger.debug(`db.getUserByUid() - ${uid} not found`);
    return undefined;
  } catch (error) {
    logger.debugError('db.getUserByUid', error);
    return undefined;
  }
};

export const getUserByUsername = async (username: string): Promise<PublicUser | undefined> => {
  try {
    logger.db(`SELECT user '${username}'`);
    const result = await pool.query('SELECT uid, username, name, email, admin, locked, stealth, deleted, created_on FROM account WHERE username = $1', [username]);
    if (result.rowCount === 1 && validators.isPublicUser(result.rows[0])) {
      return result.rows[0];
    }
    logger.debug(`db.getUserByUsername() - ${username} not found`);
    return undefined;
  } catch (error) {
    logger.debugError('db.getUserByUsername()', error);
    return undefined;
  }
};

export const getUserByCreds = async (username: string, password: string): Promise<PublicUser | undefined> => {
  try {
    logger.db(`SELECT user '${username}' and check password`);
    const result = await pool.query('SELECT uid, username, password, name, email, admin, locked, stealth, deleted, created_on FROM account WHERE username = $1',
      [username]);
    if (result.rowCount === 1 && validators.isUser(result.rows[0])) {
      const success = await userService.compareHashes(password, result.rows[0].password);
      if (success) {
        return converters.userToPublicUser(result.rows[0]);
      }
    }
    logger.debug('db.getUserByCreds - user found, password didn\'t match');
    return undefined;
  } catch (error) {
    logger.debugError('db.getUserByCreds', error);
    return undefined;
  }
};

export const getUserByUidAndPassword = async (uid: string, password: string): Promise<PublicUser | undefined> => {
  try {
    logger.db(`SELECT user ${uid} and check password`);
    const result = await pool.query('SELECT uid, username, password, name, email, admin, locked, stealth, deleted, created_on FROM account WHERE uid = $1', [uid]);
    if (result.rowCount === 1 && validators.isUser(result.rows[0])) {
      // if password is valid -> return found user (as public user)
      const success = await userService.compareHashes(password, result.rows[0].password);
      if (success) {
        return converters.userToPublicUser(result.rows[0]);
      }
    }
  } catch (error) {
    logger.debugError('db.checkPasswordByUid()', error);
  }
  // default to undefined
  return undefined;
};

export const updateUser = async (user: PublicUser): Promise<boolean> => {
  logger.db(`UPDATE user '${user.uid}' and SET username, name, email and stealth`);
  // make sure user REALLY is valid and that UID is set
  if (!user.uid || !validators.isPublicUser(user)) {
    logger.log('db.updateUser() - malformed parameters given');
    return false;
  }
  try {
    // We expect that the user has been verified before
    const result = await pool.query('UPDATE account SET username = $1, name = $2, email = $3, stealth = $4 WHERE uid = $5',
      [user.username, user.name, user.email, user.stealth, user.uid]);
    if (result.rowCount === 1) {
      logger.log('db.updateUser() - update successfull');
      return true;
    } else {
      logger.error('db.updateUser() - update failed');
      return false;
    }
  } catch (error) {
    logger.debugError('db.updateUser()', error);
    return false;
  }
};

export const updatePassword = async (uid: string, newPassword: string): Promise<boolean> => {
  // We expect password being hashed before being passed to this function
  logger.db(`UPDATE user '${uid}' and SET password`);
  try {
    const result = await pool.query('UPDATE account SET password = $1 WHERE uid = $2', [newPassword, uid]);
    if (result.rowCount === 1) {
      logger.log('db.updatePassword() - success');
      return true;
    }
    logger.log('db.updatePassword() - failure');
    return false;
  } catch (error) {
    logger.debugError('db.updatePassword()', error);
    return false;
  }
};

export const deleteUser = async (uid: string): Promise<boolean> => {
  try {
    logger.db(`UPDATE user '${uid}' and SET delete = true`);
    const result = await pool.query('UPDATE account SET name = \'\', email = \'\', password = \'\', deleted = TRUE WHERE uid = $1', [uid]);
    if (result.rowCount === 1) {
      // We have updated a row
      logger.log(`db.deleteUser - ${uid} deleted`);
      return true;
    }
    if (result.rowCount > 1) {
      // A horrible mistake has happened!
      logger.error(`db.deleteUser - ${uid} affected multiple rows!`);
      return false;
    }
    logger.log(`db.deleteUser - ${uid} couldn't be deleted: no such uid`);
    return false;
  } catch (error) {
    logger.debugError('db.deleteUser', error);
    return false;
  }
};
