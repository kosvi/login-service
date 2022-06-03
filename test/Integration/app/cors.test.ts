/* eslint-disable no-console */
import { Pool } from 'pg';
import supertest from 'supertest';
import { app } from '../../../src/app';

// We need to mock database to test whitelists (these tests should be moved to Unit)
jest.mock('pg', () => {
  const mockPool = {
    query: jest.fn()
  };
  return { Pool: jest.fn(() => mockPool) };
});

const api = supertest(app);

describe('cors tests', () => {

  let pool: Pool;

  beforeEach(() => {
    pool = new Pool();
  });

  test('OPTIONS from non-whitelisted host returns ...', async () => {
    // mock the response from database
    (pool.query as jest.Mock).mockResolvedValue({
      rows: [{
        id: 1,
        name: 'test service 1',
        host: 'http://foo.example.com', trusted: true
      }], rowCount: 1
    });
    const response = await api.get('/hello').set('Origin', 'http://foo.example.com');
    console.log(response.headers);
    expect(response.body).toHaveProperty('msg');
  });
});
