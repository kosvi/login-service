/*
 * This file contains all functions needed when running "migration"-scripts on startup
 */

import { pool } from './db';
import { Migration } from '../../types';
import { logger } from '../../utils/logger';

export const runSingleQuery = async (sql: string): Promise<boolean> => {
  try {
    await pool.query(sql);
  } catch (error) {
    logger.debugError('runSingleQuery()', error);
    return false;
  }
  return true;
};

const checkMigrationsTable = async (): Promise<boolean> => {
  try {
    await pool.query(
      'CREATE TABLE IF NOT EXISTS migration (id VARCHAR(50) PRIMARY KEY, created_on TIMESTAMP NOT NULL DEFAULT current_timestamp);'
    );
  } catch (error) {
    logger.debugError('checkMigrationTable()', error);
    return false;
  }
  return true;
};

export const runMigrations = async (migrations: Array<Migration>): Promise<boolean> => {
  // First make sure migration table exists
  if (!(await checkMigrationsTable())) {
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
      const success = await runSingleQuery(m.up);
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

export const revertMigrations = async (migrations: Array<Migration>, down: Array<string>): Promise<boolean> => {
  // First make sure migration table exists
  if (!(await checkMigrationsTable())) {
    return false;
  }
  // next run all migrations asked if they exist in migration table
  try {
    // we start at the end of down array
    for (let i = down.length - 1; i >= 0; i--) {
      // check if migration exists in database
      const result = await pool.query('SELECT * FROM migration WHERE id = $1', [down[i]]);
      if (result.rowCount < 1) {
        // migration does not exist, no need to remove
        continue;
      }
      // find down query for migration
      const migration = migrations.find(m => m.id === down[i]);
      if (!migration) {
        // what kind of sorcery is this?!?
        logger.debug(`revertMigrations() - no migration exists with id '${down[i]}`);
        continue;
      }
      const success = await runSingleQuery(migration.down);
      if (success) {
        await pool.query(
          'DELETE FROM migration WHERE id = $1',
          [migration.id]
        );
      } else {
        // delete failed
        logger.error(`couldn't revert migration ${migration.id}`);
        return false;
      }
    }
  } catch (error) {
    logger.debugError('revertMigrations()', error);
    return false;
  }
  return true;
};
