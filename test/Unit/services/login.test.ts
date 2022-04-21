import { PublicUser } from '../../../src/types';
import { loginService } from '../../../src/services';
import { testData } from '../utils/helperData';

describe('loginService tests', () => {

  it('should not return name and email from stealth user', () => {
    // make user with stealth mode enabled 
    const stealthUser: PublicUser = {
      ...testData.validPublicUser,
      stealth: true
    };
    const responseBody = loginService.createResponseFromPublicUser(stealthUser);
    expect(responseBody).toHaveProperty('token');
    expect(responseBody).toHaveProperty('content');
    expect(responseBody.content).toHaveProperty('uid');
    expect(responseBody.content).not.toHaveProperty('name');
    expect(responseBody.content).not.toHaveProperty('email');
  });

  it('should return name and email from non-stealth user', () => {
    // make user with stealth mode enabled 
    const user: PublicUser = {
      ...testData.validPublicUser,
      stealth: false
    };
    const responseBody = loginService.createResponseFromPublicUser(user);
    expect(responseBody).toHaveProperty('token');
    expect(responseBody).toHaveProperty('content');
    expect(responseBody.content).toHaveProperty('uid');
    expect(responseBody.content).toHaveProperty('name');
    expect(responseBody.content).toHaveProperty('email');
  });

});
