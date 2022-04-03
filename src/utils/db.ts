// https://www.digitalocean.com/community/tutorials/how-to-use-postgresql-with-node-js-on-ubuntu-20-04

/* eslint-disable no-console */
import { Pool } from 'pg';
import { User } from '../types';
import { DATABASE_URL } from './config';

const pool = new Pool({
  connectionString: DATABASE_URL
});

const addUser = async (user: User): Promise<boolean> => {
  const result = await pool.query(
    'INSERT INTO users (uid, username, password, name, email) VALUES ($1, $2, $3, $4, $5)',
    [user.uid, user.username, user.password, user.name, user.email]
  );
  console.log(result);
  return true;
};

export const db = {
  pool, addUser
};