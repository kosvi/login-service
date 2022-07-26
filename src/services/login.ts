import { PublicUser, TokenContent } from '../types';
import { validators } from '../utils/validators';
import { tokenService } from './tokenService';

const createResponseFromPublicUser = (user: PublicUser): { token: string, content: TokenContent } => {

  // handle content validity
  if (!validators.isString(user.uid)) {
    // ALL users in database MUST have UID
    throw new Error('no UID found');
  }

  return tokenService.createLoginToken(user);

};

export const loginService = {
  createResponseFromPublicUser
};
