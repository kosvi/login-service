import { codeService } from '../services/codes';
import { Controller, HttpRequest, HttpResponse } from '../types';
import { ControllerError } from '../utils/customErrors';
import { logger } from '../utils/logger';
import { responseHandlers } from '../utils/responseHandlers';
import { validators } from '../utils/validators';

export class TokenController implements Controller {
  controllerName = 'TokenController';

  async handleRequest(req: HttpRequest, res: HttpResponse): Promise<void> {
    if (req.url === '/token' && req.method === 'POST') {
      await this.checkCode(req, res);
    }
  }

  /*
   * This function checks code and returns token if code is valid
   */
  async checkCode(req: HttpRequest, res: HttpResponse) {
    const body = req.body;
    try {
      if (!validators.isTokenRequest(body)) {
        throw new ControllerError(400, 'malformed request');
      }
      if (body.grant_type !== 'authorization_code') {
        throw new ControllerError(405, 'only accepting code grant');
      }
      const token = await codeService.getTokenForCode(body.code, body.client_id, body.code_verifier, body.redirect_uri);
      responseHandlers.setHeaderJson(res);
      responseHandlers.setStatus(200, res);
      res.end(JSON.stringify({
        access_token: token.token,
        token_type: 'Bearer',
        expires_in: token.content.expires
      }));
    } catch (error) {
      if (error instanceof ControllerError) {
        logger.debugError(`${this.controllerName}.checkCode()`, error);
        throw error;
      } else if (error instanceof Error) {
        logger.debugError(`${this.controllerName}.checkCode()`, error);
        throw new ControllerError(500, error.message);
      }
      logger.debugError(`${this.controllerName}.checkCode()`, error);
      throw new ControllerError(500);
    }
  }

}