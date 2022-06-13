import { db } from '../../src/services';
import { migrations } from '../../src/migrations/migrations';
import { pool } from '../../src/services/database/db';

export const resetDatabase = async () => {
  const allMigrations: Array<string> = migrations.reduce((prev: Array<string>, curr) => {
    return prev.concat(curr.id);
  }, []);
  expect(await db.revertMigrations(migrations, allMigrations)).toBe(true);
  expect(await db.runMigrations(migrations)).toBe(true);
};

export const closeDatabase = async () => {
  await pool.end();
};