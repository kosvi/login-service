/*
 * This controller simply hands out tokens for valid log ins
 */

import { ZodError } from 'zod';
import { userService } from '../services';
import { Controller, HttpRequest, HttpResponse, PublicUser } from '../types';
import { ControllerError } from '../utils/customErrors';
import { logger } from '../utils/logger';
import { responseHandlers } from '../utils/responseHandlers';
import { loginService } from '../services';
import { LoginBody } from '../types';
import { parsers } from '../utils/parsers';

export class LoginController implements Controller {

  controllerName = 'LoginController';

  async handleRequest(req: HttpRequest, res: HttpResponse): Promise<void> {
    responseHandlers.setCors(res, req.headers.origin);
    if (req.url === '/login' && req.method === 'POST') {
      await this.login(req, res);
    } else {
      throw new ControllerError(404, 'not found');
    }
  }

  async login(req: HttpRequest, res: HttpResponse) {
    try {
      /*
       * Parse request body and use 'username' and 'password' to fetch PublicUser from database
       */
      const parsedBody = LoginBody.parse(parsers.parseStringToJson(req.body));
      const user: PublicUser | undefined = await userService.findByUsernameAndPassword(parsedBody.username, parsedBody.password);
      if (user) {
        /*
         * If user was fetched, create token and send response
         */
        responseHandlers.setHeaderJson(res);
        responseHandlers.setStatus(200, res);
        res.end(JSON.stringify(loginService.createResponseFromPublicUser(user)));
      } else {
        /*
         * If user was not found, send 401
         */
        logger.log(`LoginController - Failed login: ${parsedBody.username} @ ${req.headers.host}`);
        throw new ControllerError(401, 'incorrect username or password');
      }
    } catch (error) {
      /*
       * Finally handle possible errors and throw correct statuscodes in all cases
       */
      if (error instanceof Error) {
        logger.debug(`LoginController - Failed login: ${error.name}`);
        if (error.name === 'SyntaxError') {
          throw new ControllerError(400, 'malformed request');
        }
      }
      if (error instanceof ZodError) {
        throw new ControllerError(400, 'malformed request');
      }
      if (error instanceof ControllerError) {
        throw error;
      }
      throw new ControllerError(500, 'unknown error');
    }
  }

}