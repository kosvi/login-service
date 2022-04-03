/*
 * Define constants here!
 */

export const NODE_ENV = process.env.NODE_ENV || 'production';
export const DATABASE_URL = process.env.DATABASE_URL || 'postgres://user:password@localhost:port/db';
export const PORT = 3001;
export const USER_CONSTANTS = {
  USERNAME_MIN_LENGTH: 3,
  NAME_MIN_LENGTH: 6,
};