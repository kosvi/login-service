/*
 *  This allows us to build better ways to log and debug 
 *  once the application grows bigger
 */

import { DEBUG_MODE, NODE_ENV } from './config';

const handleLine = (type: string, line: string) => {
  if (NODE_ENV === 'test' && !DEBUG_MODE) {
    return;
  }
  const date = new Date();
  const fullLine = `${date.toISOString()} - ${type} - ${line}`;
  // eslint-disable-next-line no-console
  console.log(fullLine);
};

const log = (line: string) => {
  handleLine('LOG', line);
};

const error = (line: string) => {
  handleLine('ERROR', line);
};

const db = (line: string) => {
  handleLine('DATABASE', line);
};

const debug = (line: string) => {
  if (DEBUG_MODE) {
    handleLine('DEBUG', line);
  }
};

const debugError = (source: string, err: unknown) => {
  if (DEBUG_MODE && err instanceof Error) {
    debug(`${source} - ${err.name}: ${err.message}`);
  }
};

export const logger = {
  log, error, db, debug, debugError
};
