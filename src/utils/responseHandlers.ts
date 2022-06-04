/*
 * These functions allow setting headers and body to responses.
 * As they are quite small functions, their main goal is to minimize typos from headers etc.
 */

import { db } from '../services';
import { HttpResponse, StatusCode } from '../types';

const setStatus = (statusCode: StatusCode, res: HttpResponse): HttpResponse => {
  res.writeHead(statusCode);
  return res;
};

const setCors = async (res: HttpResponse, origin: string): Promise<HttpResponse> => {
  // first check if the host is whitelisted
  try {
    const whitehost = await db.findHost(origin);
    if (whitehost) {
      // host was found, let's check permissions
      let permissions = 'OPTIONS, POST';
      if (whitehost.trusted) {
        permissions += ', GET, PUT, PATCH, DELETE';
      }
      // set headers correctly
      res.setHeader('Access-Control-Allow-Origin', whitehost.host);
      res.setHeader('Access-Control-Allow-Methods', permissions);
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    }
    // if host was not found -> don't update headers
    return res;
  } catch (error) {
    return res;
  }
};

const setHeaderJson = (res: HttpResponse): HttpResponse => {
  res.setHeader('Content-Type', 'application/json');
  return res;
};

const setHeaderHtml = (res: HttpResponse): HttpResponse => {
  res.setHeader('Content-Type', 'text/html');
  return res;
};

export const responseHandlers = {
  setStatus, setCors, setHeaderJson, setHeaderHtml
};
