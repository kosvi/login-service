/* 
 * This file contains all the functions needed when accessing users table in the database
 */


import { Whitehost } from '../../types';
import { logger } from '../../utils/logger';
import { validators } from '../../utils/validators';
import { pool } from './db';

export const findHost = async (host: string): Promise<Whitehost | undefined> => {
  try {
    logger.db(`SELECT ${host} from whitelisted`);
    const result = await pool.query('SELECT id, name, host, trusted FROM whitelist WHERE host = $1', [host]);
    if (result.rowCount === 1 && validators.isWhitehost(result.rows[0])) {
      return result.rows[0];
    }
    logger.debug(`db.findHost() - ${host} not found`);
    return undefined;
  } catch (error) {
    logger.debugError('db.findHost()', error);
    return undefined;
  }
};