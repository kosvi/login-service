/*
 * This controller verifies the token provided and returns the information about the user
 */

import { JsonWebTokenError } from 'jsonwebtoken';
import { VerifyService } from '../services/verify';
import { Controller, HttpRequest, HttpResponse, TokenContent } from '../types';
import { ControllerError } from '../utils/customErrors';
import { logger } from '../utils/logger';
import { responseHandlers } from '../utils/responseHandlers';
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
    if (!req.headers.authorization || !validators.isString(req.headers.authorization) || !req.headers.authorization.toLowerCase().startsWith('bearer ')) {
      // no authorzation token given, failure:
      logger.log(`${this.controllerName} - malformed authorization header`);
      throw new ControllerError(401, 'malformed or missing token');
    }
    try {
      // Extract the actual token from header
      const tokenString = req.headers.authorization.substring(7);
      // Extract the content from the token
      const tokenContent: TokenContent = VerifyService.getContentFromToken(tokenString);
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