import fs from 'fs';
import path from 'path';
import { Controller, HttpRequest, HttpResponse } from '../../../src/types';
import { StaticController } from '../../../src/controllers';
import { mockResponse } from '../utils/mockers';
import { verify200isReturned, verify404isThrown } from '../utils/helperFunctions';

describe('StaticController tests', () => {

  let req: HttpRequest | undefined, res: HttpResponse;
  let controller: Controller;

  beforeEach(() => {
    jest.clearAllMocks();
    // ret request undefined and reset response and controller
    req = undefined;
    res = mockResponse();
    controller = new StaticController();
  });

  it('should return 200 from GET to /static', async () => {
    req = { url: '/static', method: 'GET', headers: {} };
    await controller.handleRequest(req, res);
    // let's not mock, but instead compare actual file content
    const content = fs.readFileSync(path.join(process.cwd(), 'static/ui.html'), 'utf-8');
    verify200isReturned(req, res, 'text/html', content);
  });

  it('should return 404 with any other path', async () => {
    req = { url: '/static/some-other-path', method: 'GET', headers: {} };
    await verify404isThrown(req, res, controller);
  });

});