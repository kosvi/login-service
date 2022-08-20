import { Code, TokenContent } from '../types';
import { CODE_LENGTH } from '../utils/config';
import { validators } from '../utils/validators';
import { db } from './database';

// https://dropbox.tech/developers/pkce--what-and-why-
import { createHash, randomBytes, } from 'crypto';
import { tokenService } from './tokenService';
import { logger } from '../utils/logger';

const base64Encode = (str: Buffer): string => {
  // https://www.w3schools.com/jsref/jsref_replace.asp
  return str.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

const codeVerifier = (code_verifier: string, code_challenge: string): boolean => {
  const hash = base64Encode(createHash('sha256').update(code_verifier).digest());
  if (hash === code_challenge) {
    return true;
  }
  return false;
};

const codeGenerator = (): string => {
  const code = `${(new Date().getTime()).toString()}-${base64Encode(randomBytes(parseInt(CODE_LENGTH)))}`;
  return code;
};

const addCode = async (obj: unknown): Promise<Code | undefined> => {
  logger.debug(`codeService.addCode() : typeof obj === 'object' => ${typeof obj === 'object'}`);
  let code;
  if (typeof obj === 'object') {
    code = {
      ...obj,
      code: codeGenerator()
    };
  }
  if (validators.isCode(code)) {
    const result = await db.addCode(code);
    return result;
  }
  return undefined;
};

const getTokenForCode = async (code: string, client_id: string, code_verifier: string, redirect_uri: string): Promise<{ token: string, content: TokenContent }> => {
  // first find the code from database
  try {
    const codeFromDB = await db.findCode(code);
    // make sure we got a result with the code and that client_id, redirect_uri and code_challenge match
    if (codeFromDB && client_id === codeFromDB.client_id && codeFromDB.redirect_uri === redirect_uri && codeVerifier(code_verifier, codeFromDB.code_challenge)) {
      let tokenContent: Omit<TokenContent, 'expires'> = {
        uid: codeFromDB.uid,
        username: codeFromDB.username,
        read_only: codeFromDB.read_only,
        resource: codeFromDB.resource_id
      };
      if (codeFromDB.full_info) {
        tokenContent = { ...tokenContent, email: codeFromDB.email, name: codeFromDB.name };
      }
      // content handled, let's make a token from it
      return tokenService.createClientToken(tokenContent);
    }
  } catch (error) {
    logger.debugError('codeService.getTokenForCode()', error);
  }
  throw new Error('failed to verify request');
};

export const codeService = {
  addCode, getTokenForCode
};
