/*
 * Define constants here!
 */

import { dotenv } from './dotenv';
dotenv.initializeEnv();

export const NODE_ENV = process.env.NODE_ENV || 'production';
export const DEBUG_MODE = process.env.DEBUG_MODE || false;
export const DATABASE_URL = process.env.DATABASE_URL || 'postgres://user:password@localhost:port/db';
export const PORT = process.env.PORT || 3000;
export const SECRET = process.env.SECRET || ((NODE_ENV === 'test') ? '' : process.exit(2));
export const USER_CONSTANTS = {
  USERNAME_MIN_LENGTH: 3,
  NAME_MIN_LENGTH: 6,
};
export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: process.env.PASSWORD_MIN_LENGTH || 10,
  BOTH_CASES: process.env.PASSWORD_REQUIRE_BOTH_CASES || true,
  SPECIAL_CHARACTER: process.env.PASSWORD_REQUIRE_SPECIAL_CHARACTER || true,
  // make sure lines below contain same information of required special chars
  VALID_SPECIAL_CHARACTERS: '@#$%&_;:,.!?()',
  VALID_SPECIAL_CHARACTERS_REGEX: /['@#$%&_;:,.!?()]/,
  NO_EASY: process.env.PASSWORD_REQUIRE_NO_EASY || true
};
// token lifetime is set in minutes
export const TOKEN_EXPIRE_TIME = process.env.TOKEN_EXPIRE_TIME || '5';