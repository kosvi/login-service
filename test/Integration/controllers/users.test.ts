import supertest from 'supertest';
import { app } from '../../../src/app';
import { db } from '../../../src/services';
import { PublicUser } from '../../../src/types';
import { validators } from '../../../src/utils/validators';
import { closeDatabase, isLoginBody, resetDatabase } from '../helpers';

const api = supertest(app);
const base = '/users';

const toPublicUser = (obj: unknown): PublicUser | undefined => {
  if (validators.isPublicUser(obj)) {
    return obj;
  }
  if (typeof obj === 'object' && Object.prototype.hasOwnProperty.call(obj, 'created_on')) {
    const createdOn = (obj as { created_on: unknown }).created_on;
    if (validators.isString(createdOn)) {
      const date = new Date(createdOn);
      const newObj = { ...obj, created_on: date };
      if (validators.isPublicUser(newObj)) {
        return newObj;
      }
    }
  }
  return undefined;
};

// setup database for tests
beforeAll(async () => {
  await resetDatabase();
});

describe('UsersController integration tests', () => {

  // this is our test user added to database before each test
  const newUser = {
    username: 'tester',
    password: 'D1ff1cu!tPwd#1',
    name: 'Test User',
    email: 'tester@example.com'
  };

  // this token can be send in requests as logged in user
  let token: string;

  // first make sure to get a fresh token before each test
  beforeEach(async () => {
    // first reset database content
    await resetDatabase();
    // and add our default user
    await api.post(`${base}/save`).send(newUser).expect(201);
    // login and get token
    const response = await api.post('/login').send({
      username: newUser.username,
      password: newUser.password
    }).expect(200);
    expect(isLoginBody(response.body)).toBe(true);
    if (isLoginBody(response.body)) {
      token = response.body.token;
    }
  });

  /*
   * HERE ARE THE ACTUAL TESTS
   */

  it('should give users details on /me', async () => {
    const response = await api.get(`${base}/me`).set('Authorization', `bearer ${token}`).expect(200);
    const user = toPublicUser(response.body);
    expect(validators.isPublicUser(user)).toBe(true);
    if (validators.isPublicUser(user)) {
      expect(typeof user.uid).toBe('string');
      expect(user.username).toBe(newUser.username);
      expect(user.name).toBe(newUser.name);
      expect(user.email).toBe(newUser.email);
      expect(user.admin).toBe(false);
      expect(user.locked).toBe(false);
      expect(user.stealth).toBe(true);
      expect(user.deleted).toBe(false);
    }
  });

  it('should be able to store new users', async () => {
    const userDetails = {
      username: 'newdude',
      password: 'JustT0M4ke$ure!',
      name: 'New Dude',
      email: 'newdude@example.com'
    };
    const response = await api.post(`${base}/save`).send(userDetails).expect(201);
    // response should return PublicUser
    const publicUser = toPublicUser(response.body);
    expect(publicUser).not.toBe(undefined);
    // we should have a user created, make sure it exists in database ()
    const queryResult = await db.getUserByCreds(userDetails.username, userDetails.password);
    expect(queryResult).not.toBe(undefined);
    // queryresult should equal to publicuser returned by api (if we just add the created_on)
    expect(queryResult).toEqual({ ...publicUser, created_on: queryResult?.created_on });
  });

  it('should be able to edit existing users', async () => {
    const response = await api.put(`${base}/save`).set('Authorization', `bearer ${token}`).send({
      username: 'tester2',
      password: newUser.password,
      name: 'New Name',
      email: 'tester2@example.net',
      stealth: false
    }).expect(200);
    expect(response.body).not.toBe(undefined);
    const publicUser = toPublicUser(response.body);
    expect(validators.isPublicUser(publicUser)).toBe(true);
    if (validators.isPublicUser(publicUser)) {
      expect(publicUser.username).toBe('tester2');
      expect(publicUser.name).toBe('New Name');
      expect(publicUser.email).toBe('tester2@example.net');
      expect(publicUser.stealth).toBe(false);
    }
    // let's see that things look good at database also
    const queryResult = await db.getUserByUid(publicUser?.uid || '');
    expect(validators.isPublicUser(queryResult)).toBe(true);
    if (validators.isPublicUser(queryResult)) {
      expect(queryResult.username).toBe('tester2');
      expect(queryResult.name).toBe('New Name');
      expect(queryResult.email).toBe('tester2@example.net');
      expect(queryResult.stealth).toBe(false);
    }
  });

});

// close connections to database to let jest exit without problems
afterAll(async () => {
  await closeDatabase();
});
