import supertest from 'supertest';
import { app } from '../../../src/app';

const api = supertest(app);

describe('/hello', () => {
  test('GET /hello should return ok', async () => {
    const response = await api.get('/hello').expect(200);
    expect(response.body).toHaveProperty('msg');
  });
  test('GET /hello/foo should return 404', async () => {
    const response = await api.get('/hello/foo').expect(404);
    expect(response.body).toHaveProperty('error');
  });
});
