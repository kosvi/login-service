import supertest from 'supertest';
import { app } from '../../../src/app';
import { closeDatabase, resetDatabase } from '../helpers';

const api = supertest(app);
const base = '/codes';

describe('codesController integration tests', () => {

  // setup database
  beforeEach(async () => {
    await resetDatabase();
  });

  const newCode = {
    user_uid: 'foo'
  };

  it('should ', () => {
    expect(1).toBe(1);
  });

  afterAll(async () => {
    await closeDatabase();
  });

});
