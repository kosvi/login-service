import { hostService, userService, VerifyService } from '../services';
import { Controller, HttpRequest, HttpResponse, TokenContent } from '../types';
import { converters } from '../utils/converters';
import { ControllerError } from '../utils/customErrors';
import { logger } from '../utils/logger';
import { parsers } from '../utils/parsers';
import { responseHandlers } from '../utils/responseHandlers';
import { validators } from '../utils/validators';

export class HostController implements Controller {

  controllerName = 'HostController';

  async handleRequest(req: HttpRequest, res: HttpResponse): Promise<void> {
    if (!(await this.checkPermission(req))) {
      throw new ControllerError(403, 'not authorized');
    }
    if (req.url === '/hosts' && req.method === 'POST') {
      await this.addHost(req, res);
    }
    else if (req.url?.startsWith('/hosts/') && !isNaN(converters.unknownToInteger(req.url.substring(7))) && req.method === 'PUT') {
      await this.editHost(req, res);
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

  /*
   * This function adds a new whitelisted host
   */
  async addHost(req: HttpRequest, res: HttpResponse) {
    try {
      const newHost = await hostService.addHost(parsers.parseStringToJson(req.body ? req.body : '{}'));
      if (validators.isWhitehost(newHost)) {
        responseHandlers.setHeaderJson(res);
        responseHandlers.setStatus(201, res);
        res.end(JSON.stringify(newHost));
      } else {
        throw new ControllerError(400, 'malformed request');
      }
    } catch (error) {
      logger.debugError(`${this.controllerName} - addHost()`, error);
      // this could be internal error (like db failure), but let's just assume malformed req body
      throw error;
    }
  }

  /*
   * This function allows updating a host
   */
  async editHost(req: HttpRequest, res: HttpResponse) {
    const id = converters.unknownToInteger(req.url?.substring(7));
    const data = parsers.parseStringToJson(req.body ? req.body : '{}');
    try {
      const newData = await hostService.editHost(id, data);
      if (validators.isWhitehost(newData)) {
        responseHandlers.setHeaderJson(res);
        responseHandlers.setStatus(200, res);
        res.end(JSON.stringify(newData));
      } else {
        throw new ControllerError(500);
      }
    } catch (error) {
      logger.debugError(`${this.controllerName} - editHost()`, error);
      if (error instanceof ControllerError) {
        throw error;
      } else {
        throw new ControllerError(500);
      }
    }
  }

}
