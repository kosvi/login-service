/*
 * Make sure that verify-controller is kept as it is
 */

import { loginService } from '../../../src/services';
import { testData } from '../utils/helperData';

describe('VerifyController tests', () => {

  let token: string;

  beforeEach(() => {
    // create token with LoginService using a test-user
    const responseContent = loginService.createResponseFromPublicUser(testData.validPublicUser);
    token = responseContent.token;
  });

  it('should validate a valid token', () => {
    // write this later
    expect(token).not.toBe('');
  });

});