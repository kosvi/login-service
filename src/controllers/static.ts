import { staticService } from '../services';
import { Controller, HttpRequest, HttpResponse } from '../types';
import { NODE_ENV } from '../utils/config';
import { ControllerError } from '../utils/customErrors';
import { responseHandlers } from '../utils/responseHandlers';

export class StaticController implements Controller {

  controllerName = 'StaticController';

  async handleRequest(req: HttpRequest, res: HttpResponse): Promise<void> {
    if (req.url === '/static' && req.method === 'GET') {
      await this.getPage(req, res);
    } else {
      throw new ControllerError(404, 'not found');
    }
  }

  async getPage(_req: HttpRequest, res: HttpResponse) {
    try {
      const content = await staticService.getUI();
      responseHandlers.setHeaderHtml(res);
      responseHandlers.setStatus(200, res);
      res.end(content);
    } catch (error) {
      if (NODE_ENV === 'dev') {
        throw error;
      }
      throw new ControllerError(500, 'server is missing a file');
    }
  }

}