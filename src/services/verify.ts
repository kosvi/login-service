import { TokenContent } from '../types';

import { verify } from 'jsonwebtoken';
import { SECRET } from '../utils/config';
import { ControllerError } from '../utils/customErrors';

const getContentFromToken = (token: string): TokenContent => {
  if (!SECRET) {
    throw new ControllerError(500);
  }
  const tokenContent = verify(token, SECRET) as TokenContent;
  // now we just need to make sure that token hasn't expired
  const currentTime = Math.floor(new Date().getTime() / 1000);
  if (currentTime > tokenContent.expires) {
    throw new ControllerError(401, 'token expired');
  }
  return {
    uid: tokenContent.uid,
    username: tokenContent.username,
    read_only: tokenContent.read_only,
    expires: tokenContent.expires,
    // these are only added if they are in the actual token
    ...(tokenContent.name && { name: tokenContent.name }),
    ...(tokenContent.email && { email: tokenContent.email })
  };
};

const extractTokenContentFromAuthHeader = (authHeader: string | undefined): TokenContent => {
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    // ok, we have a good start
    return getContentFromToken(authHeader.substring(7));
  } else {
    // no good, throw error
    throw new ControllerError(401, 'malformed or missing token');
  }
};

export const VerifyService = {
  getContentFromToken, extractTokenContentFromAuthHeader
};