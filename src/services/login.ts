import { sign } from 'jsonwebtoken';
import { PublicUser, TokenContent } from '../types';
import { SECRET, TOKEN_EXPIRE_TIME } from '../utils/config';
import { parsers } from '../utils/parsers';
import { validators } from '../utils/validators';

const createResponseFromPublicUser = (user: PublicUser): { token: string, content: TokenContent } => {

  // handle content validity
  if (!validators.isString(user.uid)) {
    // ALL users in database MUST have UID
    throw new Error('no UID found');
  }

  // create token content
  const content: TokenContent = {
    uid: user.uid,
    username: user.username,
    name: user.name,
    email: user.email,
    read_only: true,
    expires: createExpireTime(),
  };
  // sign token
  const token = sign(content, SECRET);
  return { token: token, content: content };
};

// add TOKEN_EXPIRE_TIME as minutes to current time before token is expired
const createExpireTime = (): number => {
  return Math.floor(new Date().getTime() / 1000) + (parsers.parseNumber(TOKEN_EXPIRE_TIME) * 60);
};

export const loginService = {
  createResponseFromPublicUser
};
