/*
 * This is my dotenv replacement without any dependencies. A bit simple, but gets to job done. 
 * 
 * A lot of inspiration taken from: 
 * https://github.com/heusalagroup/fi.hg.core/blob/main/ProcessUtils.ts
 * (MIT-license and author is aware I am using his code)
 */

import { existsSync, readFileSync } from 'fs';
import path from 'path';

const parseLine = (variableObj: Record<string, string>, line: string): Record<string, string> => {
  // let's make sure we have a name for the variable
  if (line.indexOf('=') < 1) {
    // either there is no = in the line or the line starts with it
    return variableObj;
  }
  // Jaakko did this without regexp, but I'll go with regexp
  const parts = line.split(/=(.*)/);
  const key = parts[0].trim();
  const value = parts[1].trim();
  // make sure our key only contains a-zA-Z0-9_
  if (key.length > 0 && value.length > 0 && key.match(/^[\w]+$/)) {
    variableObj[key] = value;
  }
  return variableObj;
};

// This was so elegantly written by Jaakko that I will not make changes to it

const parseEnv = (content: string): Record<string, string> => {
  const rows = content.split('\n');
  return rows.reduce(parseLine, {});
};

const initializeEnv = () => {
  const file = path.join(process.cwd(), '.env');
  if (!existsSync(file)) {
    return;
  }
  const content = readFileSync(file, { encoding: 'utf-8' });
  const envAdditions = parseEnv(content);
  // variables set in .env -file will be overwritten by those already in process.env
  process.env = {
    ...envAdditions,
    ...process.env
  };
};

export const dotenv = {
  initializeEnv
};
