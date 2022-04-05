/*
 * Define constants here!
 */

import { dotenv } from './dotenv';
dotenv.initializeEnv();

export const NODE_ENV = process.env.NODE_ENV || 'production';
export const DATABASE_URL = process.env.DATABASE_URL || 'postgres://user:password@localhost:port/db';
export const PORT = process.env.PORT || 3000;
export const USER_CONSTANTS = {
  USERNAME_MIN_LENGTH: 3,
  NAME_MIN_LENGTH: 6,
};