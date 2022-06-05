/*
 * These tests do NOT test to the depth of database. Instead
 * database responses are mocked so tests can be run without database.
 * 
 * However, they should test correctly the behaviour on OPTIONS-requests
 */

import { Pool } from 'pg';
import supertest from 'supertest';
import { app } from '../../../src/app';
import { testData } from '../../Unit/utils/helperData';

// We need to mock database to test whitelists
jest.mock('pg', () => {
  const mockPool = {
    query: jest.fn()
  };
  return { Pool: jest.fn(() => mockPool) };
});

// we need to launch an instance of the app for the test, this is the easiest way...
const api = supertest(app);

describe('cors tests', () => {

  let pool: Pool;

  beforeEach(() => {
    pool = new Pool();
  });

  test('OPTIONS from non-whitelisted host returns ...', async () => {
    // mock the response from database
    (pool.query as jest.Mock).mockResolvedValueOnce({
      rows: [], rowCount: 0
    });
    const response = await api.options('/login').set('Origin', testData.validWhitehost.host);

    // our database didn't find the host requested, so no CORS related headers should appear
    expect(response.headers).not.toHaveProperty('access-control-allow-origin');
    expect(response.headers).not.toHaveProperty('access-control-allow-methods');
    expect(response.headers).not.toHaveProperty('access-control-allow-headers');
  });

  test('OPTIONS from whitelisted host returns correct headers', async () => {
    // mock the response from database
    (pool.query as jest.Mock).mockResolvedValue({
      rows: [testData.validWhitehost], rowCount: 1
    });
    const response = await api.options('/login').set('Origin', testData.validWhitehost.host);

    // First check Origin header
    expect(response.headers).toHaveProperty('access-control-allow-origin');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(response.headers['access-control-allow-origin']).toBe(testData.validWhitehost.host);

    // Second check methods header
    expect(response.headers).toHaveProperty('access-control-allow-methods');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(response.headers['access-control-allow-methods']).toBe('OPTIONS, POST');

    // Third check headers header
    expect(response.headers).toHaveProperty('access-control-allow-headers');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(response.headers['access-control-allow-headers']).toBe('Content-Type');
  });
});
