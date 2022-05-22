/*
 * This controller verifies the token provided and returns the information about the user
 */

import { VerifyService } from '../services/verify';
import { Controller, HttpRequest, HttpResponse, TokenContent } from '../types';
import { ControllerError } from '../utils/customErrors';
import { logger } from '../utils/logger';
import { validators } from '../utils/validators';

export class VerifyController implements Controller {

  controllerName = 'VerifyController';

  handleRequest(req: HttpRequest, res: HttpResponse): void {
    if (req.url === '/verify' && req.method === 'GET') {
      this.verifyToken(req, res);
    } else {
      throw new ControllerError(404, 'not found');
    }
  }

  verifyToken(req: HttpRequest, res: HttpResponse) {
    if (!req.headers.authorization || !validators.isString(req.headers.authorization || !req.headers.authorization.toLowerCase().startsWith('bearer '))) {
      // no authorzation token given, failure:
      logger.log(`${this.controllerName} - malformed authorization header`);
      throw new ControllerError(400, 'malformed token');
    }
    try {
      const tokenString = req.headers.authorization.substring(7);
      const tokenContent: TokenContent = VerifyService.getContentFromToken(tokenString);
      logger.debug(`${this.controllerName} - verified user ${tokenContent.username}`);
      res.end(JSON.stringify(tokenContent));
    } catch (error) {
      if (error instanceof ControllerError) {
        logger.debug(`${this.controllerName} - ControllerError thrown`);
        throw error;
      }
      throw new ControllerError(500, 'unknown error');
    }
  }

}