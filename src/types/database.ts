/*
export interface User {
  uid?: string,
  username: string,
  name: string,
  password: string
}*/

import { z } from 'zod';
import { USER_CONSTANTS } from '../utils/config';


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
  stealth: z.boolean().default(true)
});

export type User = z.infer<typeof ZodUser>;