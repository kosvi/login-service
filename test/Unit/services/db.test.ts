/* eslint-disable @typescript-eslint/unbound-method */
/*
 * Test migration function and other database functions
 */

import { Pool } from 'pg';
import { db } from '../../../src/services';

import { userService } from '../../../src/services';
import { validators } from '../../../src/utils/validators';
import { PublicUser, User, Whitehost } from '../../../src/types';
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
    up: 'CREATE TABLE foo (id VARCHAR(40) PRIMARY KEY, somevalue TEXT);',
    down: 'DROP TABLE IF EXISTS foo;'
  },
  {
    id: 'mig2',
    up: 'INSERT INTO foo (id, somevalue) VALUES (\'foo\', \'bar\');',
    down: 'DELETE FROM foo WHERE id = \'foo\';'
  }
  ];

  // make new pool for each test
  beforeEach(() => {
    pool = new Pool();
  });

  // and reset jest.fn after each so we can start counting from 0
  afterEach(() => {
    jest.clearAllMocks();
    (pool.query as jest.Mock).mockReset();
  });

  it('should try to create migration table', async () => {
    (pool.query as jest.Mock).mockResolvedValue({ rows: [{}], rowCount: 1 });
    // these migrations are found from db (mockedValue / rowCount: 1)
    const result = await db.runMigrations(migrations);
    expect(result).toBe(true);
    // CREATE migration + two migrations as params (SELECT = found) = 3 queries
    expect(pool.query).toBeCalledTimes(3);
    expect(pool.query).toHaveBeenNthCalledWith(1, 'CREATE TABLE IF NOT EXISTS migration (id VARCHAR(50) PRIMARY KEY, created_on TIMESTAMP NOT NULL DEFAULT current_timestamp);');
    expect(pool.query).toHaveBeenNthCalledWith(2, 'SELECT * FROM migration WHERE id = $1', [migrations[0].id]);
    expect(pool.query).toHaveBeenNthCalledWith(3, 'SELECT * FROM migration WHERE id = $1', [migrations[1].id]);
  });

  it('should do the migrations', async () => {
    (pool.query as jest.Mock).mockResolvedValue({ rows: [], rowCount: 0 });
    const result = await db.runMigrations(migrations);
    expect(result).toBe(true);
    // This becomes more tricky to count:
    // - 1 for creating migration table
    // - 1 SELECT to see if migration exists, 1 for actual migration + 1 for adding to migration table
    // - 2 migrations to be done
    // total of 1 + 2*3 = 7
    expect(pool.query).toBeCalledTimes(7);
    expect((pool.query as jest.Mock).mock.calls).toEqual([
      ['CREATE TABLE IF NOT EXISTS migration (id VARCHAR(50) PRIMARY KEY, created_on TIMESTAMP NOT NULL DEFAULT current_timestamp);'],
      ['SELECT * FROM migration WHERE id = $1', [migrations[0].id]],
      [migrations[0].up],
      ['INSERT INTO migration (id) VALUES ($1)', [migrations[0].id]],
      ['SELECT * FROM migration WHERE id = $1', [migrations[1].id]],
      [migrations[1].up],
      ['INSERT INTO migration (id) VALUES ($1)', [migrations[1].id]]
    ]);
  });

  it('should revert migrations by request', async () => {
    // We need to mock the following queries:
    // - 1 for creating migration table if not exists
    // - 2 we need to find the migration from migration table to be able to revert it
    // - 3 run the down-query to revert the migration 
    // - 4 delete the migration from migrations table
    // - another iteraton of 2, 3 and 4 => total of 7 calls
    (pool.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [], rowCount: 1 });
    // now we have mocked the "everything went fine" -case
    const result = await db.revertMigrations(migrations, [migrations[0].id, migrations[1].id]);
    expect(result).toBe(true);
    expect(pool.query).toBeCalledTimes(7);
    // notable here is that the array is gone trough in reverse order!
    expect((pool.query as jest.Mock).mock.calls).toEqual([
      ['CREATE TABLE IF NOT EXISTS migration (id VARCHAR(50) PRIMARY KEY, created_on TIMESTAMP NOT NULL DEFAULT current_timestamp);'],
      ['SELECT * FROM migration WHERE id = $1', [migrations[1].id]],
      [migrations[1].down],
      ['DELETE FROM migration WHERE id = $1', [migrations[1].id]],
      ['SELECT * FROM migration WHERE id = $1', [migrations[0].id]],
      [migrations[0].down],
      ['DELETE FROM migration WHERE id = $1', [migrations[0].id]]
    ]);
  });

  it('should return false if a query fails', async () => {
    (pool.query as jest.Mock).mockRejectedValueOnce({});
    const firstQueryfails = await db.runMigrations(migrations);
    expect(firstQueryfails).toBe(false);
    jest.clearAllMocks();
    (pool.query as jest.Mock).mockReset();
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [], rowCount: 1 }).mockRejectedValueOnce({});
    const secondQueryFails = await db.revertMigrations(migrations, [migrations[0].id]);
    expect(secondQueryFails).toBe(false);
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
    // run the same test for getUserByUidAndPassword()
    (pool.query as jest.Mock).mockClear();
    const anotherPublicUser = await db.getUserByUidAndPassword('some-long-uid', 'Password!');
    expect(pool.query).toBeCalledTimes(1);
    expect((pool.query as jest.Mock).mock.calls).toEqual([
      ['SELECT uid, username, password, name, email, admin, locked, stealth, deleted, created_on FROM account WHERE uid = $1', ['some-long-uid']]
    ]);
    expect(validators.isPublicUser(anotherPublicUser)).toBe(true);
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
      ['UPDATE account SET name = \'\', email = \'\', password = \'\', deleted = TRUE WHERE uid = $1', [testUID]]
    ]);
    expect(success).toBe(true);
  });

});

describe('whitelist tests', () => {
  // this is our pool for the tests
  const pool: Pool = new Pool();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should add new host correctly', async () => {
    // mock query result
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [testData.validWhitehost], rowCount: 1 });
    // our testdata
    const newHost: Omit<Whitehost, 'id'> = {
      name: testData.validWhitehost.name,
      host: testData.validWhitehost.host,
      trusted: testData.validWhitehost.trusted
    };
    const success = await db.addHost(newHost);
    expect(pool.query).toBeCalledTimes(1);
    expect((pool.query as jest.Mock).mock.calls).toEqual([
      ['INSERT INTO whitelist (name, host, trusted) VALUES ($1, $2, $3) RETURNING *', [newHost.name, newHost.host, newHost.trusted]]
    ]);
    expect(success).toEqual(testData.validWhitehost);
  });

  it('should edit a host correctly', async () => {
    // mock query result
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [testData.validWhitehost], rowCount: 1 });
    // run edit
    const result = await db.editHost(testData.validWhitehost);
    expect(pool.query).toBeCalledTimes(1);
    expect((pool.query as jest.Mock).mock.calls).toEqual([
      ['UPDATE whitelist SET name = $1, host = $2, trusted = $3 WHERE id = $4 RETURNING *',
        [testData.validWhitehost.name, testData.validWhitehost.host, testData.validWhitehost.trusted, testData.validWhitehost.id]]
    ]);
    expect(result).toEqual(testData.validWhitehost);
  });

});
