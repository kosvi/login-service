import { logger } from './logger';
import { validators } from './validators';

const parseNumber = (num: unknown): number => {
  if (typeof num === 'number') {
    return num;
  }
  if (num instanceof Number) {
    return Number(num);
  }
  return Number(num);
};

const parseStringToJson = (str: unknown): JSON => {
  // if str is not a string, make it an empty string
  if (!validators.isString(str)) {
    str = '';
  }
  // now, if it's an empty string (either from the start of by our modification)
  // -> make it empty object
  if (validators.isString(str)) {
    const strAsString: string = str.length > 2 ? str : '{}';
    try {
      const parsedStr: JSON = JSON.parse(strAsString) as JSON;
      return parsedStr;
    } catch (error) {
      logger.debugError('parsers.parseStringToJson()', error);
    }
  }
  return JSON.parse('{}') as JSON;
};

export const parsers = {
  parseNumber, parseStringToJson
};
