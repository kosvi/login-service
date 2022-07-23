/*
 * These functions allow setting headers and body to responses.
 * As they are quite small functions, their main goal is to minimize typos from headers etc.
 */

import { HttpResponse, StatusCode } from '../types';
import { FRONTEND_URL } from './config';

const setStatus = (statusCode: StatusCode, res: HttpResponse): HttpResponse => {
  res.writeHead(statusCode);
  return res;
};

const setCors = (res: HttpResponse, origin: string | undefined): HttpResponse => {
  // first check if the origin is valid
  try {
    if (origin === FRONTEND_URL) {
      const permissions = 'OPTIONS, POST';
      // permissions += ', GET, PUT, PATCH, DELETE';
      // set headers correctly
      res.setHeader('Access-Control-Allow-Origin', FRONTEND_URL);
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
