/* eslint-disable @typescript-eslint/unbound-method */
/*
 * Test migration function and other database functions
 */

import { Pool } from 'pg';
import { db } from '../../../src/services';

import { userService } from '../../../src/services';
import { validators } from '../../../src/utils/validators';
import { PublicUser, User } from '../../../src/types';
// helper data
import { testData } from '../utils/helperData';

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

describe('users tests', () => {

  // this is our pool for the tests
  const pool: Pool = new Pool();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should SELECT users without password', async () => {
    // mock query results
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{}], rowCount: 1 });
    await db.getUserByUsername('username');
    expect(pool.query).toBeCalledTimes(1);
    expect((pool.query as jest.Mock).mock.calls).toEqual([
      ['SELECT uid, username, name, email, admin, locked, stealth, deleted, created_on FROM account WHERE username = $1', ['username']]
    ]);
    // and the same when selecting by UID
    jest.clearAllMocks();
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{}], rowCount: 1 });
    await db.getUserByUid('mock-uid');
    expect(pool.query).toBeCalledTimes(1);
    expect((pool.query as jest.Mock).mock.calls).toEqual([
      ['SELECT uid, username, name, email, admin, locked, stealth, deleted, created_on FROM account WHERE uid = $1', ['mock-uid']]
    ]);
  });

  it('should SELECT users with password, but not return one', async () => {
    // mock query results
    const userWithMockPassword: User = { ...testData.validPublicUser, password: await userService.hashPassword('Password!') };
    (pool.query as jest.Mock).mockResolvedValue({ rows: [userWithMockPassword], rowCount: 1 });
    const publicUser = await db.getUserByCreds('username', 'Password!');
    expect(pool.query).toBeCalledTimes(1);
    expect((pool.query as jest.Mock).mock.calls).toEqual([
      ['SELECT uid, username, password, name, email, admin, locked, stealth, deleted, created_on FROM account WHERE username = $1',
        ['username']]
    ]);
    const returnValue = validators.isPublicUser(publicUser);
    expect(returnValue).toBe(true);
  });

  it('should UPDATE user correctly', async () => {
    const testUser: PublicUser = testData.validPublicUser;
    // mock query results
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [], rowCount: 1 });
    const success = await db.updateUser(testUser);
    expect(success).toBe(true);
    // now let's make sure the query is what we expect it to be 
    expect(pool.query).toBeCalledTimes(1);
    expect((pool.query as jest.Mock).mock.calls).toEqual([
      ['UPDATE account SET username = $1, name = $2, email = $3, stealth = $4 WHERE uid = $5',
        [testUser.username, testUser.name, testUser.email, testUser.stealth, testUser.uid]]
    ]);
  });

  it('should UPDATE password correctly', async () => {
    const uid = testData.validUser.uid ? testData.validUser.uid : '';
    // just to make sure there is something in the uid
    expect(uid?.length).toBeGreaterThan(1);
    const password = 'SomeD1ff1cultPwd!';
    // mock query results
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [], rowCount: 1 });
    const success = await db.updatePassword(uid, password);
    expect(success).toBe(true);
    expect(pool.query).toBeCalledTimes(1);
    expect((pool.query as jest.Mock).mock.calls).toEqual([
      ['UPDATE account SET password = $1 WHERE uid = $2', [password, uid]]
    ]);
  });

  it('should UPDATE user when deleting by UID', async () => {
    const testUID = 'our-test-uid';
    // mock query results
    (pool.query as jest.Mock).mockResolvedValue({ rows: [], rowCount: 1 });
    const success = await db.deleteUser(testUID);
    expect(pool.query).toBeCalledTimes(1);
    expect((pool.query as jest.Mock).mock.calls).toEqual([
      ['UPDATE account SET name = \'\', email = \'\', deleted = TRUE WHERE uid = $1', [testUID]]
    ]);
    expect(success).toBe(true);
  });

});
