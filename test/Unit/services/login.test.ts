import { PublicUser } from '../../../src/types';
import { loginService } from '../../../src/services';
import { testData } from '../utils/helperData';

describe('loginService tests', () => {

  it('should return full token content', () => {
    const user: PublicUser = {
      ...testData.validPublicUser,
    };
    const responseBody = loginService.createResponseFromPublicUser(user);
    expect(responseBody).toHaveProperty('token');
    expect(responseBody).toHaveProperty('content');
    expect(responseBody.content).toHaveProperty('uid');
    expect(responseBody.content).toHaveProperty('username');
    expect(responseBody.content).toHaveProperty('name');
    expect(responseBody.content).toHaveProperty('email');
    expect(responseBody.content).toHaveProperty('read_only');
    expect(responseBody.content).toHaveProperty('expires');
  });

});
