/*
 * This contains objects that can be send to api 
 * or are send as response by api (for easier validation)
 */

import { z } from 'zod';

/*
 * This is the content of the token
 */
export const ZodTokenContent = z.object({
  // uid
  uid: z.string().uuid(),
  // username
  username: z.string(),
  // name
  name: z.string().optional(),
  // email
  email: z.string().optional(),
  // expires
  expires: z.number()
}).strict();

export type TokenContent = z.infer<typeof ZodTokenContent>;

/*
 * This is the content send by user when logging in
 */
export const LoginBody = z.object({
  username: z.string({ required_error: 'username is required' }).regex(/^[a-z0-9]+$/),
  password: z.string({ required_error: 'password is required' })
}).strict();

export type LoginBodyType = z.infer<typeof LoginBody>;
