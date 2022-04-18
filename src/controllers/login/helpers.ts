import { z } from 'zod';
import { PublicUser, TokenContent } from '../../types';
import { TOKEN_EXPIRE_TIME } from '../../utils/config';
import { ControllerError } from '../../utils/customErrors';
import { parsers } from '../../utils/parsers';
import { validators } from '../../utils/validators';

export const LoginBody = z.object({
  username: z.string({ required_error: 'username is required' }).regex(/^[a-z0-9]+$/),
  password: z.string({ required_error: 'password is required' })
}).strict();

export type LoginBodyType = z.infer<typeof LoginBody>;

export const createResponseFromPublicUser = (user: PublicUser): { token: string, content: TokenContent } => {

  // handle content validity
  if (!validators.isString(user.uid)) {
    throw new ControllerError(500, 'database request failed');
  }

  let privateContent: { name?: string, email?: string } = {};
  if (!user.stealth) {
    privateContent = {
      name: user.name,
      email: user.email
    };
  }
  // create expiretime
  const currentTime = Math.floor(new Date().getTime() / 1000);
  const content: TokenContent = {
    uid: user.uid,
    username: user.username,
    expires: (currentTime) + (parsers.parseNumber(TOKEN_EXPIRE_TIME) * 60),
    ...privateContent
  };
  return { token: 'foobar', content: content };
};