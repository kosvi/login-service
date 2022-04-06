import fs from 'fs';
import { Controller, HttpRequest, HttpResponse } from '../../src/types';
import { ProfileController } from '../../src/controllers';
import { mockResponse } from '../utils/mockers';
import { verify200isReturned, verify404isReturned } from '../utils/helperFunctions';

// mock readFileSync (test will fail if you remove existsSync)
jest.mock('fs', () => {
  const mockFS = {
    readFileSync: jest.fn(),
    existsSync: jest.fn()
  };
  return mockFS;
});

describe('ProfileController tests', () => {

  let req: HttpRequest | undefined, res: HttpResponse;
  let controller: Controller;

  beforeEach(() => {
    jest.clearAllMocks();
    // ret request undefined and reset response and controller
    req = undefined;
    res = mockResponse();
    controller = new ProfileController();
  });

  it('should return 200 from GET to /profile', async () => {
    // mock readFileSync result
    (fs.readFileSync as jest.Mock).mockReturnValueOnce('file content');
    // and the actual test
    req = { url: '/profile', method: 'GET' };
    await controller.handleRequest(req, res);
    verify200isReturned(req, res, 'text/html', 'file content');
  });

  it('should return 404 with any other path', async () => {
    req = { url: '/profile/1', method: 'GET' };
    await verify404isReturned(req, res, controller);
  });

});