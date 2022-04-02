/*
 *  This allows us to build better ways to log and debug 
 *  once the application grows bigger
 */

const log = (line: string) => {
  // eslint-disable-next-line no-console
  console.log(line);
};

const error = (line: string) => {
  // eslint-disable-next-line no-console
  console.error(line);
};

export const logger = {
  log, error
};
