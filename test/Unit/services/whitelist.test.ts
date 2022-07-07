import { hostService } from '../../../src/services';
import { testData } from '../utils/helperData';
import { Whitehost } from '../../../src/types';

import { Pool } from 'pg';
import { verifyAsyncThrows } from '../utils/helperFunctions';

// mock pg / pool.query 
jest.mock('pg', () => {
  const mockPool = {
    query: jest.fn()
  };
  return { Pool: jest.fn(() => mockPool) };
});

describe('hosts service tests', () => {
  // this is our pool for the tests
  const pool: Pool = new Pool();

  afterEach(() => {
    jest.clearAllMocks();
    (pool.query as jest.Mock).mockReset();
  });

  it('should allow adding a host', async () => {
    // mock database query results
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [testData.validWhitehost], rowCount: 1 });
    // now let's create the body of a valid requst
    const newHost: unknown = {
      name: testData.validWhitehost.name,
      host: testData.validWhitehost.host,
      trusted: testData.validWhitehost.trusted
    };
    // and let's add the newHost
    const result = await hostService.addHost(newHost);
    expect(result).toEqual(testData.validWhitehost);
  });

  it('should fail nicely if request body is invalid', async () => {
    // mock success in db query to make sure we actually fail before it
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [testData.validWhitehost], rowCount: 1 });
    // this is invalid new host
    const newHost: unknown = {
      name: 'valid name',
      host: 'invalid-host-name',
      trusted: false
    };
    const result = await hostService.addHost(newHost);
    expect(result).toBe(undefined);
  });

  it('should allow editing a host', async () => {
    // mock success in db query
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [testData.validWhitehost], rowCount: 1 });
    // create our test data
    const id = testData.validWhitehost.id;
    const newData: unknown = {
      name: testData.validWhitehost.name,
      host: testData.validWhitehost.host,
      trusted: testData.validWhitehost.trusted
    };
    const result = await hostService.editHost(id, newData);
    expect(result).toEqual(testData.validWhitehost);
  });

  it('should throw error on invalid data', async () => {
    // mock success in db query to make sure we actually fail before it
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [testData.validWhitehost], rowCount: 1 });
    // this is invalid new host
    const newData: unknown = {
      name: 'valid name',
      host: 'invalid-host-name',
      trusted: false
    };
    const result = await verifyAsyncThrows<Whitehost>(hostService.editHost(testData.validWhitehost.id, newData), 'malformed request');
    expect(result).toBe(true);
  });

});
