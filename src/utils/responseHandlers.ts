/*
 * These functions allow setting headers and body to responses.
 * As they are quite small functions, their main goal is to minimize typos from headers etc.
 */

import { HttpResponse, StatusCode } from '../types';

const setStatus = (statusCode: StatusCode, res: HttpResponse): HttpResponse => {
  res.writeHead(statusCode);
  return res;
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
  setStatus, setHeaderJson, setHeaderHtml
};
