import supertest from 'supertest';
import { Client } from '../../../src/types';
import { app } from '../../../src/app';
import { testData } from '../../Unit/utils/helperData';
import { closeDatabase, isLoginBody, resetDatabase } from '../helpers';
import { validators } from '../../../src/utils/validators';

const api = supertest(app);
const base = '/clients';

// setup database for tests
beforeAll(async () => {
  await resetDatabase();
});

describe('clientController integration tests', () => {

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

  it('should allow storing of a valid client', async () => {
    const newClient: Omit<Client, 'id'> = {
      name: testData.validPublicClient.name,
      redirect_uri: testData.validPublicClient.redirect_uri,
      secret: 'mocked',
      allow_write: testData.validPublicClient.allow_write
    };
    // let's send this as request body
    const response = await api.post(base).set('Authorization', authContent).send(newClient).expect(201);
    expect(response.body).toHaveProperty('id');
  });

  it('should allow editing a stored client', async () => {
    const newClient: Omit<Client, 'id'> = {
      name: testData.validPublicClient.name,
      redirect_uri: testData.validPublicClient.redirect_uri,
      secret: 'mocked',
      allow_write: testData.validPublicClient.allow_write
    };
    // let's add the client
    const addResponse = await api.post(base).set('Authorization', authContent).send(newClient).expect(201);
    expect(validators.isPublicClient(addResponse.body)).toBe(true);
    let id = '';
    const data: Omit<Client, 'id'> = {
      name: 'another cool service',
      redirect_uri: 'http://must-be-a-valid.host.name',
      secret: 'mocked2',
      allow_write: testData.validPublicClient.allow_write
    };
    if (validators.isPublicClient(addResponse.body)) {
      id = addResponse.body.id;
    }
    // ok, we have the id and new data
    const editResponse = await api.put(`${base}/${id}`).set('Authorization', authContent).send(data).expect(200);
    expect(validators.isPublicClient(editResponse.body)).toBe(true);
    expect(editResponse.body).toEqual({ id: id, name: data.name, redirect_uri: data.redirect_uri });
  });

});

afterAll(async () => {
  await closeDatabase();
});
