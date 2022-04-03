/*
 * Will simply strip unwanted content from IncomingMessage and
 * parse json body if needed
 */

import { IncomingMessage } from 'http';
import { HttpRequest } from '../types';

// We parse body (if one exists) into a string
// It will still need to be parsed as Object later
const parseBody = (req: IncomingMessage): Promise<string> => {
  return new Promise((resolv, reject) => {
    try {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });
      req.on('end', () => {
        resolv(body);
      });
    } catch (error) {
      if (error instanceof Error) {
        reject(error.message);
      } else {
        reject('unknown error');
      }
    }
  });
};

const parseRequest = async (req: IncomingMessage): Promise<HttpRequest> => {
  const body = await parseBody(req);
  return {
    url: req.url,
    method: req.method,
    body: body
  };
};

export const parsers = {
  parseRequest
};
