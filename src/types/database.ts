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
import { CLIENT_CONSTANTS, USER_CONSTANTS } from '../utils/config';

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
  // deleted
  deleted: z.boolean().default(false),
  // created_on
  created_on: z.date().optional(),
}).strict();

export type User = z.infer<typeof ZodUser>;
export type PublicUser = Omit<User, 'password'>;

export const ZodClient = z.object({
  // id
  id: z.string().uuid(),
  // name
  name: z.string({
    required_error: 'client needs a unique name'
  }).min(CLIENT_CONSTANTS.NAME_MIN_LENGTH),
  // redirect_uri
  redirect_uri: z.string({
    required_error: 'client needs a unique redirect uri'
  }).url({
    message: 'invalid url'
  }).min(CLIENT_CONSTANTS.URI_MIN_LENGTH),
  // secret
  secret: z.string()
}).strict();

export type Client = z.infer<typeof ZodClient>;
export type PublicClient = Omit<Client, 'secret'>;

export const ZodCode = z.object({
  // id
  id: z.number(),
  // user_uid (foreign_key)
  user_uid: z.string().uuid(),
  // client_id (foreign_key)
  client_it: z.string().uuid(),
  // code
  code: z.string(),
  // code_challenge
  code_challenge: z.string(),
  // full_info
  full_info: z.boolean().default(false),
  // created_on
  created_on: z.date().optional()
}).strict();

export type Code = z.infer<typeof ZodClient>
