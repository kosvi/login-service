import { Controller, HttpRequest, HttpResponse } from '../../../src/types';
import { HelloController } from '../../../src/controllers';
import { mockResponse } from '../utils/mockers';
import { verify200isReturned, verify404isThrown } from '../utils/helperFunctions';

describe('HelloController tests', () => {

  let req: HttpRequest | undefined, res: HttpResponse;
  let controller: Controller;

  beforeEach(() => {
    // ret request undefined and reset response and controller
    req = undefined;
    res = mockResponse();
    controller = new HelloController();
  });

  it('should return 200 from GET to /hello', async () => {
    req = { url: '/hello', method: 'GET', headers: {} };
    await controller.handleRequest(req, res);
    verify200isReturned(req, res, 'application/json', JSON.stringify({ msg: 'Hello Api' }));
  });

  it('should return 404 with any other path', async () => {
    req = { url: '/hello/world', method: 'GET', headers: {} };
    await verify404isThrown(req, res, controller);
  });

});