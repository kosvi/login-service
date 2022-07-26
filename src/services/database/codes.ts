import { Code, CodeFromDB } from '../../types';
import { validators } from '../../utils/validators';
import { pool } from './db';
import { logger } from '../../utils/logger';

export const addCode = async (code: Code): Promise<Code | undefined> => {
  try {
    logger.db(`INSERT INTO code ADD ${code.user_uid}`);
    const result = await pool.query('INSERT INTO code (user_uid, client_id, resource_id, code, code_challenge, full_info, read_only) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [code.user_uid, code.client_id, code.resource_id, code.code, code.code_challenge, code.full_info, code.read_only]);
    if (result.rowCount === 1 && validators.isCode(result.rows[0])) {
      return result.rows[0];
    }
    logger.debug('db.addCode() - failed');
  } catch (error) {
    logger.debugError('db.addCode()', error);
  }
  return undefined;
};

export const findCode = async (code: string): Promise<CodeFromDB | undefined> => {
  try {
    logger.db('SELECT code_info FROM code, account, client WHERE ...');
    const result = await pool.query('SELECT c.id, c.client_id, c.resource_id, c.full_info, c.read_only, c.code_challenge, c.created_on, u.uid, u.username, u.name, u.email, cl.redirect_uri FROM code AS c, account AS u, client AS cl WHERE c.user_uid = u.uid AND c.client_id = cl.id AND c.code = $1', [code]);
    if (result.rowCount === 1 && validators.isCodeFromDB(result.rows[0])) {
      return result.rows[0];
    }
    logger.debug('db.findCode failed');
  } catch (error) {
    logger.debugError('db.findCode()', error);
  }
  return undefined;
};
