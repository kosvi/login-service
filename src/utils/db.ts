// https://www.digitalocean.com/community/tutorials/how-to-use-postgresql-with-node-js-on-ubuntu-20-04

import { Pool } from 'pg';
import { Migration, User } from '../types';
import { DATABASE_URL } from './config';
import { logger } from './logger';

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
  await pool.query(
    'INSERT INTO users (uid, username, password, name, email) VALUES ($1, $2, $3, $4, $5)',
    [user.uid, user.username, user.password, user.name, user.email]
  );
  return true;
};

export const db = {
  pool, runMigrations, addUser
};