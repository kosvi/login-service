import { hostService } from '../../../src/services';
import { testData } from '../utils/helperData';

import { Pool } from 'pg';

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

});
