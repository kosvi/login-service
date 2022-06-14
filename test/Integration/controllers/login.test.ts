import supertest from 'supertest';
import { app } from '../../../src/app';
import { closeDatabase, isApiError, resetDatabase } from '../helpers';

const api = supertest(app);

beforeAll(async () => {
  await resetDatabase();
});

describe('LoginController integration tests', () => {

  it('should allow login as admin', async () => {
    // send login as admin to /login
    const response = await api.post('/login').send({
      username: 'admin',
      password: 'Password!'
    }).expect(200);
    expect(response.body).toHaveProperty('token');
  });

  it('should give proper response on incorrect creds', async () => {
    // send invalid creds to /login
    const response = await api.post('/login').send({
      username: 'foo',
      password: 'bar'
    }).expect(401);
    expect(isApiError(response.body)).toBe(true);
    if (isApiError(response.body)) {
      expect(response.body.error).toBe('incorrect username or password');
    }
  });

  it('should give proper response on malformed request', async () => {
    // send totally f***ed up message body
    const response = await api.post('/login').send({
      foobar: 'yo mamma is so fubar!',
    }).expect(400);
    expect(isApiError(response.body)).toBe(true);
    if (isApiError(response.body)) {
      expect(response.body.error).toBe('malformed request');
    }
  });

  it('should give 404 for non-POST queries', async () => {
    const response = await api.get('/login').expect(404);
    expect(isApiError(response.body)).toBe(true);
  });

});

afterAll(async () => {
  await closeDatabase();
});