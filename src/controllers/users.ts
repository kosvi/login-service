import { userService, VerifyService } from '../services';
import { Controller, HttpRequest, HttpResponse, PublicUser, TokenContent, UpdatePasswordBody, UpdatePasswordBodyType, ZodUser } from '../types';
import { ControllerError } from '../utils/customErrors';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';
import { parsers } from '../utils/parsers';
import { responseHandlers } from '../utils/responseHandlers';
import { validators } from '../utils/validators';
import { converters } from '../utils/converters';

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
    if (req.url?.startsWith('/users/') && this.checkUid(req, res) && req.method === 'GET') {
      await this.returnMe(req, res);
    } else if (req.url === '/users' && req.method === 'POST') {
      await this.addUser(req, res);
    } else if (req.url?.startsWith('/users/') && this.checkUid(req, res) && req.method === 'PUT') {
      await this.updateMe(req, res);
    } else if (req.url?.startsWith('/users/') && req.url.endsWith('password') && this.checkUid(req, res) && req.method === 'PATCH') {
      await this.updateMyPassword(req, res);
    } else if (req.url?.startsWith('/users/') && this.checkUid(req, res) && req.method === 'DELETE') {
      await this.deleteMe(req, res);
    } else {
      throw new ControllerError(404);
    }
  }

  /*
   * This simply makes sure UID in URL matches the one in the token
   */
  checkUid(req: HttpRequest, _res: HttpResponse) {
    if (!this.tokenContent) {
      throw new ControllerError(401, 'not logged in');
    }
    if (req.url?.substring(43, 7) === this.tokenContent?.uid) {
      return true;
    }
    throw new ControllerError(400, 'uid mismatch');
  }

  /*
   * This function simply returns the information of the logged in user 
   */
  async returnMe(req: HttpRequest, res: HttpResponse) {
    if (!this.tokenContent) {
      // user not logged in -> 401
      throw new ControllerError(401, 'not logged in');
    }
    const me = await userService.findUserByUid(this.tokenContent.uid);
    responseHandlers.setCors(res, req.headers.origin);
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
    // parse the request body (body should include the current password!)
    const parseResult = ZodUser.safeParse({ ...parsers.parseStringToJson(req.body) });
    let givenValues: PublicUser | undefined;
    if (parseResult.success) {
      givenValues = parseResult.data;
    }
    if (!validators.isUser(givenValues)) {
      // failure -> couldn't parse the request body
      throw new ControllerError(400, 'malformed request');
    }
    try {
      // update the user and see if we succeeded
      const updatedUser = await userService.updateUser(this.tokenContent.uid, givenValues.password, converters.userToPublicUser(givenValues));
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
   * This function simply deletes the user currently logged in
   */
  async deleteMe(_req: HttpRequest, res: HttpResponse) {
    // make sure user is logged in
    if (!this.tokenContent) {
      throw new ControllerError(401, 'not logged in');
    }
    try {
      if (await userService.deleteUser(this.tokenContent.uid)) {
        responseHandlers.setHeaderJson(res);
        responseHandlers.setStatus(204, res);
        res.end();
      } else {
        throw new ControllerError(500);
      }
    } catch (error) {
      // this could be simply removed as we don't really need the try - catch here
      // deleting should be pretty straight forward job and failures are all 500 at this point
      logger.debugError('deleteMe()', error);
      if (error instanceof ControllerError) {
        throw error;
      }
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
      responseHandlers.setCors(res, req.headers.origin);
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