/*
 * This Controller simply says hello. 
 * It's only use is for testing deployment and to make sure the server is running after deployment
 */

import { helloService } from '../services';
import { Controller, HttpRequest, HttpResponse } from '../types';
import { ControllerError } from '../utils/customErrors';
import { logger } from '../utils/logger';
import { responseHandlers } from '../utils/responseHandlers';

export class HelloController implements Controller {

  controllerName = 'HelloController';

  async handleRequest(req: HttpRequest, res: HttpResponse) {
    if (req.url === '/hello' && req.method === 'GET') {
      await this.getHello(req, res);
    } else {
      throw new ControllerError(404, 'not found');
    }
  }

  async getHello(_req: HttpRequest, res: HttpResponse) {
    try {
      responseHandlers.setHeaderJson(res);
      responseHandlers.setStatus(200, res);
      const content = await helloService.sayHello();
      res.end(JSON.stringify(content));
    } catch (_error) {
      logger.error('error in sayHello()');
    }
  }
}