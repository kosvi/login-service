import { Resource } from '../../types';
import { logger } from '../../utils/logger';
import { validators } from '../../utils/validators';
import { pool } from './db';

export const addResource = async (resource: Resource): Promise<boolean> => {
  try {
    logger.db(`INSERT INTO resource ADD ${resource.name}`);
    const result = await pool.query('INSERT INTO resource (id, name) VALUES ($1, $2)', [resource.id, resource.name]);
    if (result.rowCount === 1) {
      // success
      return true;
    }
    logger.debug(`db.addResource() - ${resource.name} couldn't be added`);
  } catch (error) {
    logger.debugError('db.addResource()', error);
  }
  return false;
};

export const findResource = async (id: string): Promise<Resource | undefined> => {
  try {
    logger.db(`SELECT ${id} FROM resource`);
    const result = await pool.query('SELECT id, name FROM resource WHERE id = $1', [id]);
    if (result.rowCount === 1 && validators.isResource(result.rows[0])) {
      return result.rows[0];
    }
    logger.debug(`db.findResource() - ${id} not found`);
  } catch (error) {
    logger.debugError('db.findResource()', error);
  }
  return undefined;
};
