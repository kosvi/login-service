import supertest from 'supertest';
import { Whitehost } from '../../../src/types';
import { app } from '../../../src/app';
import { testData } from '../../Unit/utils/helperData';
import { closeDatabase, isLoginBody, resetDatabase } from '../helpers';
import { validators } from '../../../src/utils/validators';

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

  it('should allow editing a stored host', async () => {
    const newHost: Omit<Whitehost, 'id'> = {
      name: testData.validWhitehost.name,
      host: testData.validWhitehost.host,
      trusted: testData.validWhitehost.trusted
    };
    // let's add the host
    const addResponse = await api.post(base).set('Authorization', authContent).send(newHost).expect(201);
    expect(validators.isWhitehost(addResponse.body)).toBe(true);
    let id = 0;
    const data: Omit<Whitehost, 'id'> = {
      name: 'another cool service',
      host: 'http://must-be-a-valid.host.name',
      trusted: !testData.validWhitehost.trusted
    };
    if (validators.isWhitehost(addResponse.body)) {
      id = addResponse.body.id;
    }
    // ok, we have the id and new data
    const editResponse = await api.put(`${base}/${id}`).set('Authorization', authContent).send(data).expect(200);
    expect(validators.isWhitehost(editResponse.body)).toBe(true);
    expect(editResponse.body).toEqual({ id: id, ...data });
  });

});

afterAll(async () => {
  await closeDatabase();
});
