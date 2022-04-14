/*
 * This file contains all functions needed when running "migration"-scripts on startup
 */

import { pool } from './db';
import { Migration } from '../../types';
import { logger } from '../../utils/logger';

export const runSingleMigration = async (sql: string): Promise<boolean> => {
  try {
    await pool.query(sql);
  } catch (error) {
    return false;
  }
  return true;
};

export const runMigrations = async (migrations: Array<Migration>): Promise<boolean> => {
  // First make sure migration table exists
  try {
    await pool.query(
      'CREATE TABLE IF NOT EXISTS migration (id VARCHAR(50) PRIMARY KEY, created_on TIMESTAMP NOT NULL DEFAULT current_timestamp);'
    );
  } catch (error) {
    logger.debugError('runMigrations()', error);
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
    logger.debugError('runMigrations()', error);
    return false;
  }
  return true;
};
