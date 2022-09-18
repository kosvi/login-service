import { VerifyService } from '../services';
import { codeService } from '../services/codes';
import { Controller, HttpRequest, HttpResponse, TokenContent } from '../types';
import { ControllerError } from '../utils/customErrors';
import { logger } from '../utils/logger';
import { parsers } from '../utils/parsers';
import { responseHandlers } from '../utils/responseHandlers';
import { validators } from '../utils/validators';

export class CodeController implements Controller {

  controllerName = 'CodeController';
  tokenContent: TokenContent | undefined;

  async handleRequest(req: HttpRequest, res: HttpResponse): Promise<void> {
    responseHandlers.setCors(res, req.headers.origin);
    this.tokenContent = VerifyService.extractTokenContentFromAuthHeader(req.headers.authorization);
    if (req.url === '/codes' && req.method === 'POST') {
      await this.addCode(req, res);
    }
  }

  /*
   * This function adds a code
   */
  async addCode(req: HttpRequest, res: HttpResponse) {
    if (!this.tokenContent) {
      throw new ControllerError(401);
    }
    try {
      const body = validators.isString(req.body) ? parsers.parseStringToJson(req.body) : {};
      const newCode = await codeService.addCode(this.tokenContent.uid, body);
      if (newCode) {
        responseHandlers.setHeaderJson(res);
        responseHandlers.setStatus(201, res);
        const { code } = newCode;
        res.end(JSON.stringify({ code }));
        return;
      } else {
        logger.debug(`${this.controllerName}.addCode() - codeService didn't return a valid new code`);
      }
    } catch (error) {
      logger.debugError(`${this.controllerName}.addCode()`, error);
    }
    throw new ControllerError(500);
  }

}