/* eslint-disable no-console */
// https://www.digitalocean.com/community/tutorials/how-to-use-postgresql-with-node-js-on-ubuntu-20-04

import { Pool } from 'pg';
import { Migration, PublicUser, User } from '../types';
import { DATABASE_URL } from './config';
import { logger } from './logger';
import { validators } from './validators';

const pool = new Pool({
  connectionString: DATABASE_URL
});

const runSingleMigration = async (sql: string): Promise<boolean> => {
  try {
    await pool.query(sql);
  } catch (error) {
    return false;
  }
  return true;
};

const runMigrations = async (migrations: Array<Migration>): Promise<boolean> => {
  // First make sure migration table exists
  try {
    await pool.query(
      'CREATE TABLE IF NOT EXISTS migration (id VARCHAR(50) PRIMARY KEY, created_on TIMESTAMP NOT NULL DEFAULT current_timestamp);'
    );
  } catch (error) {
    logger.logError(error);
    return false;
  }
  // next run all migrations
  try {
    for (const m of migrations) {
      // here we need to check if migration is already in the database
      const result = await pool.query('SELECT * FROM migration WHERE id = $1', [m.id]);
      if (result.rowCount > 0) {
        continue;
      }
      // if not, we add it
      const success = await runSingleMigration(m.sql);
      if (success) {
        await pool.query(
          'INSERT INTO migration (id) VALUES ($1)',
          [m.id]
        );
      } else {
        // migration failed, we cannot continue 
        logger.error(`migration '${m.id}' failed`);
        return false;
      }
    }
  } catch (error) {
    logger.logError(error);
    return false;
  }
  return true;
};

const addUser = async (user: User): Promise<boolean> => {
  try {
    await pool.query(
      'INSERT INTO users (uid, username, password, name, email) VALUES ($1, $2, $3, $4, $5)',
      [user.uid, user.username, user.password, user.name, user.email]
    );
    return true;
  } catch (error) {
    logger.logError(error);
    return false;
  }
};

const getUser = async (username: string, password: string): Promise<PublicUser | undefined> => {
  try {
    const result = await pool.query('SELECT uid, username, name, email, admin, locked, stealth, created_on FROM users\
                             WHERE username = $1 AND password = $2',
      [username, password]);
    if (validators.validateQueryResult(result) && result.rowCount === 1 && validators.isPublicUser(result.rows[0])) {
      return result.rows[0];
    }
    return undefined;
  } catch (error) {
    logger.logError(error);
    return undefined;
  }
};

export const db = {
  pool, runMigrations, addUser, getUser
};