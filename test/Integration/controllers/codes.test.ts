import supertest from 'supertest';
import { Code } from '../../../src/types';
import { app } from '../../../src/app';
import { closeDatabase, isLoginBody, resetDatabase } from '../helpers';
import { dbData } from '../helperData';

const api = supertest(app);
const base = '/codes';

describe('codesController integration tests', () => {

  let authContent: string;

  // setup database
  beforeEach(async () => {
    await resetDatabase();
    const response = await api.post('/login').send({ username: dbData.dbUser.username, password: dbData.dbUser.password }).expect(200);
    if (isLoginBody(response.body)) {
      authContent = `bearer ${response.body.token}`;
    }
  });

  const newCode: Omit<Code, 'user_uid' | 'code'> = {
    client_id: dbData.dbClient.id,
    resource_id: dbData.dbResource.id,
    code_challenge: 'xZNungXGej8ni4gNtLRbHZeQsv-qxuF3nYfkDs9zYz8',
    full_info: true,
    read_only: false
  };

  it('should add a new code', async () => {
    const response = await api.post(base).set('Authorization', authContent).send(newCode).expect(201);
    expect(response.body).toHaveProperty('code');
  });

  afterAll(async () => {
    await closeDatabase();
  });

});
