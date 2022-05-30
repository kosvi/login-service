/*
 * This controller verifies the token provided and returns the information about the user
 */

import { JsonWebTokenError } from 'jsonwebtoken';
import { VerifyService } from '../services';
import { Controller, HttpRequest, HttpResponse } from '../types';
import { ControllerError } from '../utils/customErrors';
import { logger } from '../utils/logger';
import { responseHandlers } from '../utils/responseHandlers';

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
    try {
      // Extract the token content from the auth header (throws 401 if header malformed or token expired)
      const tokenContent = VerifyService.extractTokenContentFromAuthHeader(req.headers.authorization);
      logger.debug(`${this.controllerName} - verified user ${tokenContent.username}`);
      // Return the content as response (in json format)
      responseHandlers.setHeaderJson(res);
      res.end(JSON.stringify(tokenContent));
    } catch (error) {
      // Handle different error cases
      if (error instanceof JsonWebTokenError) {
        logger.log(`${this.controllerName} - JsonWebTokenError - ${error.message}`);
        throw new ControllerError(400, 'malformed token');
      }
      if (error instanceof ControllerError) {
        logger.debug(`${this.controllerName} - ControllerError thrown`);
        throw error;
      }
      throw new ControllerError(500, 'unknown error');
    }
  }

}