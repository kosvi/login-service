/* 
 * This file contains all the functions needed when accessing users table in the database
 */


import { pool } from './db';
import { PublicUser, User } from '../../types';
import { logger } from '../../utils/logger';
import { validators } from '../../utils/validators';

export const addUser = async (user: User): Promise<boolean> => {
  // Not quite sure if we handle failures properly...
  try {
    await pool.query(
      'INSERT INTO account (uid, username, password, name, email) VALUES ($1, $2, $3, $4, $5)',
      [user.uid, user.username, user.password, user.name, user.email]
    );
    return true;
  } catch (error) {
    logger.debugError('db.addUser()', error);
    return false;
  }
};

export const getUser = async (username: string): Promise<PublicUser | undefined> => {
  try {
    const result = await pool.query('SELECT uid, username, name, email, admin, locked, stealth, created_on FROM account WHERE username = $1', [username]);
    if (result.rowCount === 1 && validators.isPublicUser(result.rows[0])) {
      return result.rows[0];
    }
    return undefined;
  } catch (error) {
    logger.debugError('db.getUser()', error);
    return undefined;
  }
};

export const getUserByCreds = async (username: string, passwordHash: string): Promise<PublicUser | undefined> => {
  try {
    const result = await pool.query('SELECT uid, username, name, email, admin, locked, stealth, created_on FROM account WHERE username = $1 AND password = $2',
      [username, passwordHash]);
    if (result.rowCount === 1 && validators.isPublicUser(result.rows[0])) {
      return result.rows[0];
    }
    return undefined;
  } catch (error) {
    logger.debugError('db.getUserByCreds', error);
    return undefined;
  }
};