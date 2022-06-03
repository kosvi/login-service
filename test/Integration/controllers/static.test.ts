/* eslint-disable no-console */
import supertest from 'supertest';
import { app } from '../../../src/app';

const api = supertest(app);

describe('/static', () => {
  test('GET /static should return ok', async () => {
    const response = await api.get('/static').expect(200).expect('Content-Type', /text\/html/);
    expect(response.text).toContain('<div id="content"></div>');
  });
  test('GET /static/foo should return 404', async () => {
    const response = await api.get('/static/foo').expect(404).expect('Content-Type', /application\/json/);
    expect(response.body).toHaveProperty('error');
  });
});