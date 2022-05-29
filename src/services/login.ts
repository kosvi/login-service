import { z } from 'zod';
import { sign } from 'jsonwebtoken';
import { PublicUser, TokenContent } from '../types';
import { SECRET, TOKEN_EXPIRE_TIME } from '../utils/config';
import { parsers } from '../utils/parsers';
import { validators } from '../utils/validators';

export const LoginBody = z.object({
  username: z.string({ required_error: 'username is required' }).regex(/^[a-z0-9]+$/),
  password: z.string({ required_error: 'password is required' })
}).strict();

export type LoginBodyType = z.infer<typeof LoginBody>;

const createResponseFromPublicUser = (user: PublicUser): { token: string, content: TokenContent } => {

  // handle content validity
  if (!validators.isString(user.uid)) {
    // ALL users in database MUST have UID
    throw new Error('no UID found');
  }

  let privateContent: { name?: string, email?: string } = {};
  if (!user.stealth) {
    privateContent = {
      name: user.name,
      email: user.email
    };
  }
  // create token content
  const content: TokenContent = {
    uid: user.uid,
    username: user.username,
    expires: createExpireTime(),
    ...privateContent
  };
  // sign token
  const token = sign(content, SECRET);
  return { token: token, content: content };
};

// We export this function to make testing easier (I haven't figured out an easier way)
const createExpireTime = (): number => {
  return Math.floor(new Date().getTime() / 1000) + (parsers.parseNumber(TOKEN_EXPIRE_TIME) * 60);
};

export const loginService = {
  createResponseFromPublicUser, createExpireTime
};
