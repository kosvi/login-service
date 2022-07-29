import { codeService } from '../services/codes';
import { Controller, HttpRequest, HttpResponse } from '../types';
import { logger } from '../utils/logger';
import { responseHandlers } from '../utils/responseHandlers';

export class CodeController implements Controller {
  controllerName = 'CodeController';

  async handleRequest(req: HttpRequest, res: HttpResponse): Promise<void> {
    if (req.url === '/codes' && req.method === 'POST') {
      await this.addCode(req, res);
    }
  }

  /*
   * This function adds a code
   */
  async addCode(req: HttpRequest, res: HttpResponse) {
    try {
      const newCode = await codeService.addCode(req.body || {});
      responseHandlers.setCors(res, req.headers.origin);
      responseHandlers.setHeaderJson(res);
      responseHandlers.setStatus(201, res);
      res.end(JSON.stringify(newCode));
    } catch (error) {
      logger.debugError(`${this.controllerName}.addCode()`, error);
    }
  }

}