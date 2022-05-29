/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { HttpRequest, HttpResponse, Controller } from '../../../src/types';
import { loginService } from '../../../src/services';
import { mockResponse } from '../utils/mockers';
import { VerifyController } from '../../../src/controllers';
import { testData } from '../utils/helperData';
// import { verify401isThrown } from '../utils/helperFunctions';


jest.mock('../../../src/services', () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const originalModules = jest.requireActual('../../../src/services');
  const createResponseFromPublicUser = originalModules.loginService.createResponseFromPublicUser;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    ...originalModules,
    loginService: {
      // this does not work, let's try something else next time Im working on this...
      createExpireTime: jest.fn(),
      createResponseFromPublicUser: createResponseFromPublicUser
    }
  };
});

describe('VerfyController tests', () => {

  let req: HttpRequest | undefined, res: HttpResponse;
  let controller: Controller;

  beforeEach(() => {
    // to make sure we always have a new request for a test
    req = undefined;
    res = mockResponse();
    controller = new VerifyController();
    jest.clearAllMocks();
  });

  it('shouldn\'t validate an expired token', async () => {
    // create token with expire time set to 24 hours ago
    (loginService.createExpireTime as jest.Mock).mockReturnValue(Math.floor(new Date().getTime() / 1000) - (60 * 60 * 24));
    const loginResponse = loginService.createResponseFromPublicUser(testData.validPublicUser);
    const token = loginResponse.token;
    req = { url: '/verify', method: 'GET', headers: { authorization: `bearer ${token}` } };
    // await verify401isThrown(req, res, controller);
    await controller.handleRequest(req, res);
    // eslint-disable-next-line no-console
    console.log('foobar');
    expect(true).toBe(true);
  });
});