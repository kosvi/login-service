import { TokenContent } from '../types';

import { verify } from 'jsonwebtoken';
import { SECRET } from '../utils/config';
import { ControllerError } from '../utils/customErrors';

const getContentFromToken = (token: string): TokenContent => {
  if (!SECRET) {
    throw new ControllerError(500);
  }
  const tokenContent = verify(token, SECRET) as TokenContent;
  return {
    uid: tokenContent.uid,
    username: tokenContent.username,
    expires: tokenContent.expires,
    // these are only added if they are in the actual token
    ...(tokenContent.name && { name: tokenContent.name }),
    ...(tokenContent.email && { email: tokenContent.email })
  };
};

export const VerifyService = {
  getContentFromToken
};