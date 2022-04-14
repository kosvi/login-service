/*
 * Sets up our connection-pool for database access
 */

import { Pool } from 'pg';
import { DATABASE_URL } from '../../utils/config';

export const pool = new Pool({
  connectionString: DATABASE_URL
});
