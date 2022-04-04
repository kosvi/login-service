/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/unbound-method */
/*
 * Test migration function and other database functions
 */

import { Pool } from 'pg';
import { db } from '../../src/utils/db';

// mock pg / pool.query 
jest.mock('pg', () => {
  const mockPool = {
    query: jest.fn()
  };
  return { Pool: jest.fn(() => mockPool) };
});

/*
 * Test migration functionality 
 * 2 tests:
 *  - when migrations are found
 *  - when migrations aren't found
 * Also notifies if developer tries to touch sql-commands ;)
 */

describe('database migration tests', () => {

  // this is our pool for the tests
  let pool: Pool;
  // and these are our test migration queries
  const migrations = [{
    id: 'mig1',
    sql: 'CREATE TABLE foo (id VARCHAR(40) PRIMARY KEY, somevalue TEXT);'
  },
  {
    id: 'mig2',
    sql: 'INSERT INTO foo (id, somevalue) VALUES (\'foo\', \'bar\')'
  }
  ];

  // make new pool for each test
  beforeEach(() => {
    pool = new Pool();
  });

  // and reset jest.fn after each so we can start counting from 0
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should try to create migration table', async () => {
    (pool.query as jest.Mock).mockResolvedValue({ rows: [{}], rowCount: 1 });
    // these migrations are found from db (mockedValue / rowCount: 1)
    await db.runMigrations(migrations);
    // CREATE migration + two migrations as params (SELECT = found) = 3 queries
    expect(pool.query).toBeCalledTimes(3);
    expect(pool.query).toHaveBeenNthCalledWith(1, 'CREATE TABLE IF NOT EXISTS migration (id VARCHAR(50) PRIMARY KEY, created_on TIMESTAMP NOT NULL DEFAULT current_timestamp);');
    expect(pool.query).toHaveBeenNthCalledWith(2, 'SELECT * FROM migration WHERE id = $1', [migrations[0].id]);
    expect(pool.query).toHaveBeenNthCalledWith(3, 'SELECT * FROM migration WHERE id = $1', [migrations[1].id]);
  });

  it('should do the migrations', async () => {
    (pool.query as jest.Mock).mockResolvedValue({ rows: [], rowCount: 0 });
    await db.runMigrations(migrations);
    // This becomes more tricky to count:
    // - 1 for creating migration table
    // - 1 SELECT to see if migration exists, 1 for actual migration + 1 for adding to migration table
    // - 2 migrations to be done
    // total of 1 + 2*3 = 7
    expect(pool.query).toBeCalledTimes(7);
    expect((pool.query as jest.Mock).mock.calls).toEqual([
      ['CREATE TABLE IF NOT EXISTS migration (id VARCHAR(50) PRIMARY KEY, created_on TIMESTAMP NOT NULL DEFAULT current_timestamp);'],
      ['SELECT * FROM migration WHERE id = $1', [migrations[0].id]],
      [migrations[0].sql],
      ['INSERT INTO migration (id) VALUES ($1)', [migrations[0].id]],
      ['SELECT * FROM migration WHERE id = $1', [migrations[1].id]],
      [migrations[1].sql],
      ['INSERT INTO migration (id) VALUES ($1)', [migrations[1].id]]
    ]);
  });

});
