/* 
 * This file contains all the functions needed when accessing whitelist table in the database
 */


import { Client, PublicClient } from '../../types';
import { logger } from '../../utils/logger';
import { validators } from '../../utils/validators';
import { pool } from './db';

export const findClient = async (id: string): Promise<Client | undefined> => {
  try {
    logger.db(`SELECT ${id} from clients`);
    const result = await pool.query('SELECT id, name, redirect_uri, secret FROM client WHERE id = $1', [id]);
    if (result.rowCount === 1 && validators.isClient(result.rows[0])) {
      return result.rows[0];
    }
    logger.debug(`db.findClient() - ${id} not found`);
    return undefined;
  } catch (error) {
    logger.debugError('db.findClient()', error);
    return undefined;
  }
};

export const addClient = async (client: Client): Promise<PublicClient | undefined> => {
  // first validate input and fail if invalid (we add an id since it's missing)
  if (!validators.isClient(client)) {
    return undefined;
  }
  try {
    logger.db(`INSERT INTO client ADD ${client.id}`);
    const result = await pool.query('INSERT INTO client (id, name, redirect_uri, secret) VALUES ($1, $2, $3, $4) RETURNING id, name, redirect_uri', [client.id, client.name, client.redirect_uri, client.secret]);
    if (result.rowCount === 1) {
      // this should probably be written better to ensure we get some information logged if returned row is not valid
      return validators.isPublicClient(result.rows[0]) ? result.rows[0] : undefined;
    }
    logger.debug(`db.addClient() - ${client.id} couldn't be added`);
  } catch (error) {
    logger.debugError('db.addClient()', error);
  }
  return undefined;
};

export const editClient = async (client: Client): Promise<PublicClient | undefined> => {
  // validate input
  if (!validators.isClient(client)) {
    return undefined;
  }
  try {
    logger.db(`UPDATE client WHERE id = ${client.id}`);
    const result = await pool.query('UPDATE client SET name = $1, redirect_uri = $2, secret = $3 WHERE id = $4 RETURNING id, name, redirect_uri', [client.name, client.redirect_uri, client.secret, client.id]);
    if (result.rowCount === 1) {
      return validators.isPublicClient(result.rows[0]) ? result.rows[0] : undefined;
    }
    logger.debug(`db.editClient() - failed to update client id ${client.id}`);
  } catch (error) {
    logger.debugError('db.editClient()', error);
  }
  return undefined;
};
