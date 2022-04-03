// https://www.digitalocean.com/community/tutorials/how-to-use-postgresql-with-node-js-on-ubuntu-20-04

/* eslint-disable no-console */
import { Pool } from 'pg';
import { Migration, User } from '../types';
import { DATABASE_URL } from './config';

const pool = new Pool({
  connectionString: DATABASE_URL
});

const runMigrations = async (_migrations: Array<Migration>): Promise<boolean> => {
  // First make sure migration table exists
  try {
    const result = await pool.query(
      'CREATE TABLE IF NOT EXISTS migration (id VARCHAR(50) PRIMARY KEY, created_on TIMESTAMP NOT NULL DEFAULT current_timestamp);'
    );
    console.log(result);
  } catch (error) {
    console.error(error);
    return false;
  }
  // next run all migrations
};

const addUser = async (user: User): Promise<boolean> => {
  const result = await pool.query(
    'INSERT INTO users (uid, username, password, name, email) VALUES ($1, $2, $3, $4, $5)',
    [user.uid, user.username, user.password, user.name, user.email]
  );
  console.log(result);
  return true;
};

export const db = {
  pool, runMigrations, addUser
};