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
import { HOST_CONSTANTS, USER_CONSTANTS } from '../utils/config';

export interface Migration {
  id: string,
  up: string,
  down: string
}

export const ZodUser = z.object({
  // uid
  uid: z.string().uuid().optional(),
  // username
  username: z.string({
    required_error: 'username is required'
  }).min(USER_CONSTANTS.USERNAME_MIN_LENGTH).regex(/^[a-z0-9]+$/, 'username must contain only letters and numbers'),
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
  // deleted
  deleted: z.boolean().default(false),
  // created_on
  created_on: z.date().optional(),
}).strict();

export type User = z.infer<typeof ZodUser>;
export type PublicUser = Omit<User, 'password'>;

export const ZodWhitehost = z.object({
  // id
  id: z.number(),
  // name
  name: z.string({
    required_error: 'host needs a unique name'
  }).min(HOST_CONSTANTS.NAME_MIN_LENGTH),
  // host
  host: z.string({
    required_error: 'host needs a unique domain'
  }).min(HOST_CONSTANTS.DOMAIN_MIN_LENGTH),
  // trusted
  trusted: z.boolean()
}).strict();

export type Whitehost = z.infer<typeof ZodWhitehost>;