/*
 * This file contains type definitions for all the objects we
 * want to store in the database. 
 *
 * using zod-objects we save A LOT of time validating objects. 
 * in addition, we can extract the type-definitions our from those zod-objects
 * 
 * you can read user-object attributes from comment-lines above attribute options
 */

import { z } from 'zod';
import { USER_CONSTANTS } from '../utils/config';

export interface Migration {
  id: string,
  sql: string
}

export const ZodUser = z.object({
  // uid
  uid: z.string().uuid().optional(),
  // username
  username: z.string({
    required_error: 'username is required'
  }).min(USER_CONSTANTS.USERNAME_MIN_LENGTH),
  // password
  password: z.string({
    required_error: 'password is required'
  }).min(1),
  // name
  name: z.string({
    required_error: 'name is required'
  }).min(USER_CONSTANTS.NAME_MIN_LENGTH),
  // email
  email: z.string({
    required_error: 'email is required'
  }).email(),
  // admin
  admin: z.boolean().default(false),
  // locked
  locked: z.boolean().default(false),
  // stealth
  stealth: z.boolean().default(true),
  // created_on
  created_on: z.string().optional(),
}).strict();

export type User = z.infer<typeof ZodUser>;
export type PublicUser = Omit<User, 'password'>;