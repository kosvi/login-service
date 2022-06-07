import { userService, VerifyService } from '../services';
import { Controller, HttpRequest, HttpResponse, TokenContent } from '../types';
import { ControllerError } from '../utils/customErrors';
import { logger } from '../utils/logger';
import { parsers } from '../utils/parsers';
import { responseHandlers } from '../utils/responseHandlers';
import { validators } from '../utils/validators';

export class UserController implements Controller {

  controllerName = 'UserController';
  tokenContent: TokenContent | undefined;

  async handleRequest(req: HttpRequest, res: HttpResponse): Promise<void> {
    // let's extract token first if user is logged in
    try {
      this.tokenContent = VerifyService.extractTokenContentFromAuthHeader(req.headers.authorization);
    } catch (error) {
      // we can just ignore errors
      this.tokenContent = undefined;
    }
    if (req.url === '/users/me' && req.method === 'GET') {
      this.returnMe(req, res);
    } else if (req.url === '/users/save' && req.method === 'PUT') {
      await this.updateMe(req, res);
    } else {
      throw new ControllerError(404);
    }
  }

  returnMe(_req: HttpRequest, res: HttpResponse) {
    if (!this.tokenContent) {
      // user not logged in -> 401
      throw new ControllerError(401, 'not logged in');
    }
    const me = userService.findUserByUid(this.tokenContent.uid);
    responseHandlers.setHeaderJson(res);
    res.end(JSON.stringify(me));
  }

  async updateMe(req: HttpRequest, res: HttpResponse) {
    if (!this.tokenContent) {
      // user not logged in -> 401
      throw new ControllerError(401, 'not logged in');
    }
    if (!req.body) {
      // no body set -> malformed request
      throw new ControllerError(400, 'no body found from request');
    }
    const currentUser = await userService.findUserByUid(this.tokenContent.uid);
    if (!currentUser) {
      // user was not found with UID in token (?!??!)
      throw new ControllerError(500);
    }
    const user: unknown = {
      ...currentUser,
      ...parsers.parseStringToJson(req.body)
    };
    if (validators.isUser(user)) {
      try {
        const updatedUser = await userService.updateUser(user);
        if (updatedUser) {
          responseHandlers.setHeaderJson(res);
          res.end(JSON.stringify(updatedUser));
        } else {
          throw new ControllerError(500);
        }
      } catch (error) {
        logger.debugError(`${this.controllerName}`, error);
        if (error instanceof ControllerError) {
          throw error;
        }
        throw new ControllerError(500);
      }
    }
  }

}