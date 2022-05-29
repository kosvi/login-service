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
  // eslint-disable-next-line no-console
  console.log(currentTime, tokenContent.expires);
  if (currentTime > tokenContent.expires) {
    throw new ControllerError(401, 'token expired');
  }
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