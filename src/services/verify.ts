import { TokenContent } from '../types';

import { verify } from 'jsonwebtoken';
import { SECRET } from '../utils/config';
import { ControllerError } from '../utils/customErrors';

const getContentFromToken = (token: string): TokenContent => {
  if (!SECRET) {
    throw new ControllerError(500);
  }
  const tokenContent = verify(token, SECRET) as TokenContent;
  return tokenContent;
};

export const VerifyService = {
  getContentFromToken
};