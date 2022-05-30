import { HttpRequest, HttpResponse, Controller } from '../../../src/types';
import { loginService } from '../../../src/services';
import { mockResponse } from '../utils/mockers';
import { VerifyController } from '../../../src/controllers';
import { testData } from '../utils/helperData';
import { verify401isThrown } from '../utils/helperFunctions';

describe('VerfyController tests', () => {

  let req: HttpRequest | undefined, res: HttpResponse;
  let controller: Controller;

  // we use fake timers to fake the timestamps in token
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date());
  });

  beforeEach(() => {
    // to make sure we always have a new request for a test
    req = undefined;
    res = mockResponse();
    controller = new VerifyController();
    jest.clearAllMocks();
  });

  it('shouldn\'t validate an expired token', async () => {
    // the token is signed on 2022/10/10
    jest.setSystemTime(new Date(2022, 10, 10));
    const loginResponse = loginService.createResponseFromPublicUser(testData.validPublicUser);
    const token = loginResponse.token;
    req = { url: '/verify', method: 'GET', headers: { authorization: `bearer ${token}` } };
    // the token is tried to verify on 2022/10/12 (two days later!)
    jest.setSystemTime(new Date(2022, 10, 12));
    // 401 should be thrown by the verify-controller
    await verify401isThrown(req, res, controller);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

});