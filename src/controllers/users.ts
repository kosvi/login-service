import { userService, VerifyService } from '../services';
import { Controller, HttpRequest, HttpResponse, TokenContent, UpdatePasswordBody, UpdatePasswordBodyType, ZodUser } from '../types';
import { ControllerError } from '../utils/customErrors';
import { ZodError } from 'zod';
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
    } else if (req.url === '/users/save' && req.method === 'POST') {
      await this.addUser(req, res);
    } else if (req.url === '/users/save' && req.method === 'PUT') {
      await this.updateMe(req, res);
    } else if (req.url === '/users/password' && req.method === 'PATCH') {
      await this.updateMyPassword(req, res);
    } else {
      throw new ControllerError(404);
    }
  }

  /*
   * This function simply returns the information of the logged in user 
   */
  returnMe(_req: HttpRequest, res: HttpResponse) {
    if (!this.tokenContent) {
      // user not logged in -> 401
      throw new ControllerError(401, 'not logged in');
    }
    const me = userService.findUserByUid(this.tokenContent.uid);
    responseHandlers.setHeaderJson(res);
    res.end(JSON.stringify(me));
  }

  /*
   * This function updates the profile of the logged in user
   */
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

  /*
   * Update password for currently logged in user
   */
  async updateMyPassword(req: HttpRequest, res: HttpResponse) {
    // make sure user is logged in
    if (!this.tokenContent) {
      throw new ControllerError(401, 'not logged in');
    }
    if (!req.body) {
      throw new ControllerError(400, 'no content in request body');
    }
    try {
      // validate body of the request
      const body: unknown = {
        ...parsers.parseStringToJson(req.body)
      };
      // This can throw ZodError
      const passwords: UpdatePasswordBodyType = UpdatePasswordBody.parse(body);
      const publicUser = await userService.updatePassword(this.tokenContent.uid, passwords.password, passwords.newPassword);
      if (publicUser) {
        responseHandlers.setHeaderJson(res);
        responseHandlers.setStatus(204, res);
        res.end();
      } else {
        responseHandlers.setHeaderJson(res);
        responseHandlers.setStatus(400, res);
        // We should check if there was an issue with the new password
        const user = await userService.findUserByUid(this.tokenContent.uid);
        if (user && userService.isValidPassword(passwords.newPassword, { ...user, password: '' })) {
          res.end(JSON.stringify({ error: 'old password was incorrect' }));
        } else {
          res.end(JSON.stringify({ error: 'new password was not strong enough' }));
        }
      }
    } catch (error) {
      logger.debugError(`${this.controllerName}`, error);
      if (error instanceof ZodError) {
        throw new ControllerError(400, error.issues[0].message);
      }
      // Else just return 500
      throw new ControllerError(500);
    }
  }

  /*
   * This function adds a new user
   */
  async addUser(req: HttpRequest, res: HttpResponse) {
    // first parse the body of the request
    if (!req.body) {
      throw new ControllerError(400, 'no content in request body');
    }
    const user: unknown = {
      // This should contain: username, password, name and email
      ...parsers.parseStringToJson(req.body),
      // others are optional or have default values
    };
    if (!validators.isUser(user)) {
      try {
        ZodUser.parse(user);
      } catch (error) {
        if (error instanceof ZodError) {
          throw new ControllerError(400, error.issues[0].message);
        }
      }
      throw new ControllerError(400, 'malformed request');
    }
    try {
      const result = await userService.addUser(user.username, user.password, user.name, user.email);
      responseHandlers.setHeaderJson(res);
      responseHandlers.setStatus(201, res);
      res.end(JSON.stringify(result));
    } catch (error) {
      logger.debugError(`${this.controllerName} - addUser()`, error);
      if (error instanceof ControllerError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new ControllerError(400, error.message);
      }
      throw error;
    }
  }

}