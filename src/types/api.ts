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
  // resource (to where the token is requested!)
  resource: z.string().uuid().optional(),
  // read_only (defines if token can be used only on GET requests)
  read_only: z.boolean().default(true),
  // expires
  expires: z.number()
}).strict();

export type TokenContent = z.infer<typeof ZodTokenContent>;

/* 
 * This is the content of a token request send by client
 */
export const ZodTokenRequest = z.object({
  grant_type: z.string(),
  code: z.string(),
  client_id: z.string().uuid(),
  code_verifier: z.string(),
  redirect_uri: z.string().url()
}).strict();

export type TokenRequest = z.infer<typeof ZodTokenRequest>;

/*
 * This is the content send by user when logging in
 */
export const LoginBody = z.object({
  username: z.string({ required_error: 'username is required' }).regex(/^[a-z0-9]+$/),
  password: z.string({ required_error: 'password is required' })
}).strict();

export type LoginBodyType = z.infer<typeof LoginBody>;

/*
 * This is the content send by user when updating password
 */
export const UpdatePasswordBody = z.object({
  password: z.string({ required_error: 'old password is required' }),
  newPassword: z.string({ required_error: 'new password is required' })
});

export type UpdatePasswordBodyType = z.infer<typeof UpdatePasswordBody>;
