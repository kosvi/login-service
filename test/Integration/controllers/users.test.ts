import supertest from 'supertest';
import { app } from '../../../src/app';
import { db } from '../../../src/services';
import { validators } from '../../../src/utils/validators';
import { checkApiError, closeDatabase, isLoginBody, resetDatabase, toPublicUser } from '../helpers';

const api = supertest(app);
const base = '/users';

// let's store current env
const ORIGINAL_ENV = process.env;

// setup database for tests
beforeAll(async () => {
  await resetDatabase();
  // Set password settings so we won't fail tests because of .env settings
  process.env = {
    ...ORIGINAL_ENV,
    PASSWORD_MIN_LENGTH: '5',
    PASSWORD_REQUIRE_BOTH_CASES: 'true',
    PASSWORD_REQUIRE_SPECIAL_CHARACTER: 'true',
    PASSWORD_REQUIRE_NO_EASY: 'true'
  };
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
  let uid: string;

  // first make sure to get a fresh token before each test
  beforeEach(async () => {
    // first reset database content
    await resetDatabase();
    // and add our default user
    await api.post(`${base}`).send(newUser).expect(201);
    // login and get token
    const response = await api.post('/login').send({
      username: newUser.username,
      password: newUser.password
    }).expect(200);
    expect(isLoginBody(response.body)).toBe(true);
    if (isLoginBody(response.body)) {
      token = response.body.token;
      uid = response.body.content.uid;
    }
  });

  /*
   * HERE ARE THE ACTUAL TESTS
   */

  it('should give users details on /me', async () => {
    const response = await api.get(`${base}/${uid}`).set('Authorization', `bearer ${token}`).expect(200);
    const user = toPublicUser(response.body);
    expect(validators.isPublicUser(user)).toBe(true);
    if (validators.isPublicUser(user)) {
      expect(typeof user.uid).toBe('string');
      expect(user.username).toBe(newUser.username);
      expect(user.name).toBe(newUser.name);
      expect(user.email).toBe(newUser.email);
      expect(user.admin).toBe(false);
      expect(user.locked).toBe(false);
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
    const response = await api.post(`${base}`).send(userDetails).expect(201);
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
    const response = await api.put(`${base}/${uid}`).set('Authorization', `bearer ${token}`).send({
      username: 'tester2',
      password: newUser.password,
      name: 'New Name',
      email: 'tester2@example.net'
    }).expect(200);
    expect(response.body).not.toBe(undefined);
    const publicUser = toPublicUser(response.body);
    expect(validators.isPublicUser(publicUser)).toBe(true);
    if (validators.isPublicUser(publicUser)) {
      expect(publicUser.username).toBe('tester2');
      expect(publicUser.name).toBe('New Name');
      expect(publicUser.email).toBe('tester2@example.net');
    }
    // let's see that things look good at database also
    const queryResult = await db.getUserByUid(publicUser?.uid || '');
    expect(validators.isPublicUser(queryResult)).toBe(true);
    if (validators.isPublicUser(queryResult)) {
      expect(queryResult.username).toBe('tester2');
      expect(queryResult.name).toBe('New Name');
      expect(queryResult.email).toBe('tester2@example.net');
    }
  });

  it('should be able to update password', async () => {
    const newPwd = 'Th1s!sL4NuPwd#1';
    await api.patch(`${base}/${uid}/password`).set('Authorization', `bearer ${token}`).send({
      password: newUser.password,
      newPassword: newPwd
    }).expect(204);
    // now, let's try to login with the new password
    const response = await api.post('/login').send({
      username: newUser.username,
      password: newPwd
    }).expect(200);
    expect(response.body).toHaveProperty('token');
  });

  /*
   * Now we have tested all successfull cases, let's try to break things up a bit
   */

  it('should give proper error instead of info if token missing', async () => {
    const noTokenResponse = await api.get(`${base}/${uid}`).expect(401);
    checkApiError(noTokenResponse.body, 'not logged in');
  });

  it('shouldn\'t accept new users with weak passwords', async () => {
    const userValues = {
      username: 'user',
      password: 'simple',
      name: 'User Name',
      email: 'user@example.net'
    };
    const newUserResponse = await api.post(`${base}`).send(userValues).expect(400);
    checkApiError(newUserResponse.body, 'password not strong enough');
  });

  it('shouldn\'t allow updating password to a weak password', async () => {
    const newPasswordResponse = await api.patch(`${base}/${uid}/password`).set('Authorization', `bearer ${token}`).send({
      password: newUser.password,
      newPassword: 'too_weak'
    }).expect(400);
    checkApiError(newPasswordResponse.body, 'new password was not strong enough');
  });

  it('should tell if password failed on password update', async () => {
    const newPasswordResponse = await api.patch(`${base}/${uid}/password`).set('Authorization', `bearer ${token}`).send({
      password: 'wrong_password',
      newPassword: 'T0tally!AV4lidPwd!!'
    }).expect(400);
    checkApiError(newPasswordResponse.body, 'old password was incorrect');
  });

  it('should handle malformed password update request body correctly', async () => {
    const noBodyResponse = await api.patch(`${base}/${uid}/password`).set('Authorization', `bearer ${token}`).send({}).expect(400);
    checkApiError(noBodyResponse.body, 'old password is required');
  });

  it('should be possible to delete account', async () => {
    // first get the UID from /me
    const meResponse = await api.get(`${base}/${uid}`).set('Authorization', `bearer ${token}`).expect(200);
    const userData = toPublicUser(meResponse.body);
    const uidFromApi: string = userData ? (userData.uid || 'invalid') : 'invalid';
    // now make sure user is found from db
    const beforeDeleteResult = await db.getUserByUid(uidFromApi);
    expect(validators.isPublicUser(beforeDeleteResult)).toBe(true);
    // now delete the user
    await api.delete(`${base}/${uidFromApi}`).set('Authorization', `bearer ${token}`).expect(204);
    // user shouldn't exist in the database
    const afterDeleteResult = await db.getUserByUid(uidFromApi);
    expect(validators.isPublicUser(afterDeleteResult)).toBe(false);
    expect(afterDeleteResult).toBe(undefined);
  });

  it('should give 400 if uid in url not matches uid in token', async () => {
    await api.get(`${base}/foobar`).set('Authorization', `bearer ${token}`).expect(400);
    await api.put(`${base}/foobar`).set('Authorization', `bearer ${token}`).send({
      username: 'tester2',
      password: newUser.password,
      name: 'New Name',
      email: 'tester2@example.net',
      stealth: false
    }).expect(400);
    await api.delete(`${base}/foobar`).set('Authorization', `bearer ${token}`).expect(400);
  });

});

// close connections to database to let jest exit without problems
afterAll(async () => {
  await closeDatabase();
  // set env to it's original state
  process.env = { ...ORIGINAL_ENV };
});
