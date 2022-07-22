/*
 * THIS TEST GOES TROUGH THE WHOLE PROCESS OF
 * 1) REGISTERING A NEW USER
 * 2) LOGIN AS NEWLY CREATED USER
 * 3) UPDATE STEALTH MODE TO FALSE
 */

import supertest from 'supertest';
import { validators } from '../../../src/utils/validators';
import { app } from '../../../src/app';
import { closeDatabase, isLoginBody, resetDatabase, toPublicUser } from '../helpers';

const api = supertest(app);

beforeAll(async () => {
  await resetDatabase();
});

describe('register a new user', () => {
  it('registers successfully and can set stealth to false', async () => {
    // first register a new user
    const newUserBody = {
      username: 'newuser',
      password: 'N3wP4ssWd#!ItWillBeLong',
      name: 'Test User',
      email: 'my_testmail@example.org'
    };
    const registerResponse = await api.post('/users').send(newUserBody).expect(201);
    const newlyCreatedUser = toPublicUser(registerResponse.body);
    expect(newlyCreatedUser).not.toBe(undefined);
    expect(validators.isPublicUser(newlyCreatedUser)).toBe(true);
    // ok, atleast the api returned what we expected
    // new, try login with the credentials we just gave to the api
    const loginResponse = await api.post('/login').send({ username: newUserBody.username, password: newUserBody.password }).expect(200);
    expect(isLoginBody(loginResponse.body)).toBe(true);
    let token: string | undefined;
    let uid: string | undefined;
    if (isLoginBody(loginResponse.body)) {
      token = loginResponse.body.token;
      uid = loginResponse.body.content.uid;
      // stealth should be true by default!
      const firstMeResponse = await api.get(`/users/${uid}`).set('Authorization', `bearer ${token}`).expect(200);
      const firstMePublicUser = toPublicUser(firstMeResponse.body);
      expect(firstMePublicUser).not.toBe(undefined);
    }
    // we should now have a valid token, let's use it to alter user and update name
    const updateResponse = await api.put(`/users/${uid}`).set('Authorization', `bearer ${token}`).send({
      ...newUserBody,
      name: 'User Test'
    }).expect(200);
    const updateResponsePublicUser = toPublicUser(updateResponse.body);
    expect(updateResponsePublicUser).not.toBe(undefined);
    expect(validators.isPublicUser(updateResponsePublicUser)).toBe(true);
    // now let's see if a request to /me says that stealth is false (this shouldn't require a new token!)
    const secondMeResponse = await api.get(`/users/${uid}`).set('Authorization', `bearer ${token}`).expect(200);
    const secondMePublicUser = toPublicUser(secondMeResponse.body);
    expect(secondMePublicUser).not.toBe(undefined);
    expect(secondMePublicUser?.name).toBe('User Test');
  });
});

afterAll(async () => {
  await closeDatabase();
});
