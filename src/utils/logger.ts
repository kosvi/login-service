/*
 *  This allows us to build better ways to log and debug 
 *  once the application grows bigger
 */

import { NODE_ENV } from './config';

const log = (line: string) => {
  if (NODE_ENV === 'dev') {
    // eslint-disable-next-line no-console
    console.log(line);
  }
};

const error = (line: string) => {
  if (NODE_ENV === 'dev') {
    // eslint-disable-next-line no-console
    console.error(line);
  }
};

export const logger = {
  log, error
};
