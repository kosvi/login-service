/*
 * This contains objects that can be returned by api 
 * or are send as response by api (for easier validation)
 */

import { z } from 'zod';

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
export interface TokenContent {
  uid: string,
  username: string,
  name?: string,
  email?: string,
  expires: number
}
*/