import { userService, VerifyService } from '../services';
import { Controller, HttpRequest, HttpResponse, TokenContent } from '../types';
import { ControllerError } from '../utils/customErrors';
import { responseHandlers } from '../utils/responseHandlers';

export class UserController implements Controller {

  controllerName = 'UserController';
  tokenContent: TokenContent | undefined;

  handleRequest(req: HttpRequest, res: HttpResponse): void | Promise<void> {
    // let's extract token first if user is logged in
    try {
      this.tokenContent = VerifyService.extractTokenContentFromAuthHeader(req.headers.authorization);
    } catch (error) {
      // we can just ignore errors
      this.tokenContent = undefined;
    }
    if (req.url === '/users/me' && req.method === 'GET') {
      this.returnMe(req, res);
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

}