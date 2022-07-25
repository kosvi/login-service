import { userService, VerifyService } from '../services';
import { Controller, HttpRequest, HttpResponse, TokenContent } from '../types';
import { logger } from '../utils/logger';
import { ControllerError } from '../utils/customErrors';
import { resourceService } from '../services/resources';
import { validators } from '../utils/validators';
import { responseHandlers } from '../utils/responseHandlers';

export class ResourceController implements Controller {

  controllerName = 'ResourceController';

  async handleRequest(req: HttpRequest, res: HttpResponse): Promise<void> {
    if (req.url?.startsWith('/resources/') && req.url.substring(11) && req.method === 'GET') {
      await this.getResource(req, res);
      return;
    }
  }

  async checkPermission(req: HttpRequest): Promise<boolean> {
    // first make sure user is logged in and is admin
    let tokenContent: TokenContent | undefined;
    try {
      tokenContent = VerifyService.extractTokenContentFromAuthHeader(req.headers.authorization);
    } catch (error) {
      logger.error(`${this.controllerName} - failed to extract token from request`);
      throw new ControllerError(401, 'login required');
    }
    // we should have token content
    try {
      const user = await userService.findUserByUid(tokenContent.uid);
      if (user?.admin) {
        return true;
      }
    } catch (error) {
      // failed to find user
      logger.debugError(this.controllerName, error);
    }
    return false;
  }

  async getResource(req: HttpRequest, res: HttpResponse) {
    const id = req.url?.substring(11) || '';
    if (id.length > 1) {
      const resource = await resourceService.getResource(id);
      if (resource && validators.isResource(resource)) {
        responseHandlers.setCors(res, req.headers.origin);
        responseHandlers.setHeaderJson(res);
        responseHandlers.setStatus(200, res);
        res.end(JSON.stringify(resource));
      } else {
        throw new ControllerError(404, 'resource not found');
      }
    } else {
      throw new ControllerError(404, 'invalid resource id');
    }
  }

}
