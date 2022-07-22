/*
 * These tests should test correctly the behaviour on OPTIONS-requests
 */

import supertest from 'supertest';
import { FRONTEND_URL } from '../../../src/utils/config';
import { app } from '../../../src/app';

// we need to launch an instance of the app for the test, this is the easiest way...
const api = supertest(app);

describe('cors tests', () => {

  test('OPTIONS from invalid origin returns ...', async () => {
    const response = await api.options('/login').set('Origin', 'http://invalid.example.com');

    // origin is invalid, so no CORS related headers should appear
    expect(response.headers).not.toHaveProperty('access-control-allow-origin');
    expect(response.headers).not.toHaveProperty('access-control-allow-methods');
    expect(response.headers).not.toHaveProperty('access-control-allow-headers');
  });

  test('OPTIONS from valid origin returns correct headers', async () => {
    const response = await api.options('/login').set('Origin', FRONTEND_URL);

    // First check Origin header
    expect(response.headers).toHaveProperty('access-control-allow-origin');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(response.headers['access-control-allow-origin']).toBe(FRONTEND_URL);

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
