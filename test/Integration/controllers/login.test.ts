import supertest from 'supertest';
import { app } from '../../../src/app';
import { closeDatabase, resetDatabase } from '../helpers';

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

});

afterAll(async () => {
  await closeDatabase();
});