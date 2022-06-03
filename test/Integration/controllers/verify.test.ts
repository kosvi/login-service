/*
 * Make sure that verify-controller is kept as it is
 */

import supertest from 'supertest';
import { TokenContent, PublicUser } from '../../../src/types';
import { app } from '../../../src/app';
import { loginService } from '../../../src/services';
import { testData } from '../../Unit/utils/helperData';
import { validators } from '../../../src/utils/validators';

const api = supertest(app);

describe('VerifyController tests', () => {

  let token: string;

  beforeEach(() => {
    // create token with LoginService using a test-user (make user not in stealth mode!)
    const testUser: PublicUser = {
      ...testData.validPublicUser,
      stealth: false
    };
    const responseContent = loginService.createResponseFromPublicUser(testUser);
    token = responseContent.token;
  });

  it('should return a valid token content', async () => {
    // send verify request with valid token
    const response = await api.get('/verify').set('Authorization', `bearer ${token}`);
    expect(validators.isTokenContent(response.body)).toBe(true);
  });

  it('should validate a valid token', async () => {
    // send verify request with valid token
    const response = await api.get('/verify').set('Authorization', `bearer ${token}`).expect(200).expect('Content-Type', /application\/json/);
    const content = response.body as TokenContent;
    expect(content.uid).toBe(testData.validPublicUser.uid);
    expect(content.username).toBe(testData.validPublicUser.username);
    expect(content.name).toBe(testData.validPublicUser.name);
  });

  it('should return 401 if no auth-header set', async () => {
    // send verify without auth header
    const response = await api.get('/verify').expect(401);
    expect(response.body).toHaveProperty('error');
  });

  it('should return 400 if bearer not in auth-header', async () => {
    // send verify without bearer in Authorization header
    const response = await api.get('/verify').set('Authorization', token).expect(401);
    expect(response.body).toHaveProperty('error');
  });

  it('should return 400 with invalid token', async () => {
    // send verify request with invalid token
    const response = await api.get('/verify').set('Authorization', `bearer ${token}invalid`).expect(400);
    expect(response.body).toHaveProperty('error');
  });

});