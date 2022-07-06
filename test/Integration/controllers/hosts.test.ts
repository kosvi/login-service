import supertest from 'supertest';
import { Whitehost } from '../../../src/types';
import { app } from '../../../src/app';
import { testData } from '../../Unit/utils/helperData';
import { closeDatabase, isLoginBody, resetDatabase } from '../helpers';

const api = supertest(app);
const base = '/hosts';

// setup database for tests
beforeAll(async () => {
  await resetDatabase();
});

describe('hostController integration tests', () => {

  // let's store admin token here
  let authContent: string;

  beforeEach(async () => {
    await resetDatabase();
    const response = await api.post('/login').send(testData.defaultAdmin).expect(200);
    if (isLoginBody(response.body)) {
      authContent = `bearer ${response.body.token}`;
    }
  });

  /*
   * LET'S START THE ACTUAL TESTS
   */

  it('should allow storing of a valid host', async () => {
    const newHost: Omit<Whitehost, 'id'> = {
      name: testData.validWhitehost.name,
      host: testData.validWhitehost.host,
      trusted: testData.validWhitehost.trusted
    };
    // let's send this as request body
    const response = await api.post(base).set('Authorization', authContent).send(newHost).expect(201);
    expect(response.body).toHaveProperty('id');
  });

});

afterAll(async () => {
  await closeDatabase();
});
