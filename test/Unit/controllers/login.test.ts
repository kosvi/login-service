import { userService } from '../../../src/services';
import { LoginController } from '../../../src/controllers';
import { HttpRequest, HttpResponse, Controller } from '../../../src/types';
import { mockResponse } from '../utils/mockers';
import { testData } from '../utils/helperData';
import { verify200isReturned } from '../utils/helperFunctions';

// mock userService 
// https://jestjs.io/docs/mock-functions#mocking-partials
jest.mock('../../../src/services', () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const originalModules = jest.requireActual('../../../src/services');
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    ...originalModules,
    userService: {
      findByUsernameAndPassword: jest.fn()
    }
  };
});

describe('LoginController tests', () => {

  let req: HttpRequest | undefined, res: HttpResponse;
  let controller: Controller;

  beforeEach(() => {
    // always reset request before new test!
    req = undefined;
    res = mockResponse();
    controller = new LoginController();
    jest.clearAllMocks();
  });

  it('should call userService with username and password and return 200 on success', async () => {
    // mock userService to provide valid user from database
    (userService.findByUsernameAndPassword as jest.Mock).mockResolvedValueOnce(testData.validPublicUser);
    // mock request
    req = { url: '/login', method: 'POST', headers: {}, body: JSON.stringify({ username: 'username', password: 'Password!' }) };
    await controller.handleRequest(req, res);
    expect(userService.findByUsernameAndPassword).toHaveBeenCalledTimes(1);
    expect(userService.findByUsernameAndPassword).toHaveBeenCalledWith('username', 'Password!');
    // now let's validate response has been altered correctly
    verify200isReturned(req, res, 'application/json');
  });

});