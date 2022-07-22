import { clientService } from '../../../src/services';
import { testData } from '../utils/helperData';
import { PublicClient } from '../../../src/types';

import { Pool } from 'pg';
import { verifyAsyncThrows } from '../utils/helperFunctions';

// mock pg / pool.query 
jest.mock('pg', () => {
  const mockPool = {
    query: jest.fn()
  };
  return { Pool: jest.fn(() => mockPool) };
});

describe('clients service tests', () => {
  // this is our pool for the tests
  const pool: Pool = new Pool();

  afterEach(() => {
    jest.clearAllMocks();
    (pool.query as jest.Mock).mockReset();
  });

  it('should allow adding a client', async () => {
    // mock database query results
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [testData.validPublicClient], rowCount: 1 });
    // now let's create the body of a valid requst
    const newClient: unknown = {
      id: testData.validPublicClient.id,
      name: testData.validPublicClient.name,
      redirect_uri: testData.validPublicClient.redirect_uri,
      secret: 'mockedI'
    };
    // and let's add the newHost
    const result = await clientService.addClient(newClient);
    expect(result).toEqual(testData.validPublicClient);
  });

  it('should fail nicely if request body is invalid', async () => {
    // mock success in db query to make sure we actually fail before it
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [testData.validPublicClient], rowCount: 1 });
    // this is invalid new client
    const newClient: unknown = {
      id: testData.validPublicClient.id,
      name: 'valid name',
      redirect_uri: 'invalid-host-name',
      secret: 'mocked'
    };
    const result = await clientService.addClient(newClient);
    expect(result).toBe(undefined);
  });

  it('should allow editing a client', async () => {
    // mock success in db query
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [testData.validPublicClient], rowCount: 1 });
    // create our test data
    const id = testData.validPublicClient.id;
    const newData: unknown = {
      name: testData.validPublicClient.name,
      redirect_uri: testData.validPublicClient.redirect_uri,
      secret: 'mocked'
    };
    const result = await clientService.editClient(id, newData);
    expect(result).toEqual(testData.validPublicClient);
  });

  it('should throw error on invalid data', async () => {
    // mock success in db query to make sure we actually fail before it
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [testData.validPublicClient], rowCount: 1 });
    // this is invalid new client
    const newData: unknown = {
      name: 'valid name',
      redirect_uri: 'invalid-host-name',
      secret: 'mocked'
    };
    const result = await verifyAsyncThrows<PublicClient>(clientService.editClient(testData.validPublicClient.id, newData), 'malformed request');
    expect(result).toBe(true);
  });

});
