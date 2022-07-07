/* 
 * This file contains all the functions needed when accessing whitelist table in the database
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

export const addHost = async (host: Omit<Whitehost, 'id'>): Promise<Whitehost | undefined> => {
  // first validate input and fail if invalid (we add an id since it's missing)
  if (!validators.isWhitehost({ id: 1, ...host })) {
    return undefined;
  }
  try {
    logger.db(`INSERT INTO whitelist ADD ${host.host}`);
    const result = await pool.query('INSERT INTO whitelist (name, host, trusted) VALUES ($1, $2, $3) RETURNING *', [host.name, host.host, host.trusted]);
    if (result.rowCount === 1) {
      // this should probably be written better to ensure we get some information logged if returned row is not valid
      return validators.isWhitehost(result.rows[0]) ? result.rows[0] : undefined;
    }
    logger.debug(`db.addHost() - ${host.host} couldn't be added`);
  } catch (error) {
    logger.debugError('db.addHost()', error);
  }
  return undefined;
};

export const editHost = async (host: Whitehost): Promise<Whitehost | undefined> => {
  // validate input
  if (!validators.isWhitehost(host)) {
    return undefined;
  }
  try {
    logger.db(`UPDATE whitelist WHERE id = ${host.id}`);
    const result = await pool.query('UPDATE whitelist SET name = $1, host = $2, trusted = $3 WHERE id = $4 RETURNING *', [host.name, host.host, host.trusted, host.id]);
    if (result.rowCount === 1) {
      return validators.isWhitehost(result.rows[0]) ? result.rows[0] : undefined;
    }
    logger.debug(`db.editHost() - failed to update host id ${host.id}`);
  } catch (error) {
    logger.debugError('db.editHost()', error);
  }
  return undefined;
};
