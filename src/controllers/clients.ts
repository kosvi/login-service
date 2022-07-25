import { clientService, userService, VerifyService } from '../services';
import { Controller, HttpRequest, HttpResponse, TokenContent } from '../types';
import { ControllerError } from '../utils/customErrors';
import { logger } from '../utils/logger';
import { parsers } from '../utils/parsers';
import { responseHandlers } from '../utils/responseHandlers';
import { validators } from '../utils/validators';

export class ClientController implements Controller {

  controllerName = 'ClientController';

  async handleRequest(req: HttpRequest, res: HttpResponse): Promise<void> {
    if (req.url?.startsWith('/clients/') && req.url.substring(9) && req.method === 'GET') {
      await this.getClient(req, res);
      return;
    }
    if (!(await this.checkPermission(req))) {
      throw new ControllerError(403, 'not authorized');
    }
    if (req.url === '/clients' && req.method === 'POST') {
      await this.addClient(req, res);
    }
    else if (req.url?.startsWith('/clients/') && req.url.substring(9) && req.method === 'PUT') {
      await this.editClient(req, res);
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
   * This function adds a client
   */
  async addClient(req: HttpRequest, res: HttpResponse) {
    try {
      const newClient = await clientService.addClient(parsers.parseStringToJson(req.body ? req.body : '{}'));
      if (validators.isPublicClient(newClient)) {
        responseHandlers.setHeaderJson(res);
        responseHandlers.setStatus(201, res);
        res.end(JSON.stringify(newClient));
      } else {
        throw new ControllerError(400, 'malformed request');
      }
    } catch (error) {
      logger.debugError(`${this.controllerName} - addClient()`, error);
      // this could be internal error (like db failure), but let's just assume malformed req body
      throw error;
    }
  }

  /*
   * This function allows updating a client
   */
  async editClient(req: HttpRequest, res: HttpResponse) {
    const id = req.url?.substring(9) || '';
    const data = parsers.parseStringToJson(req.body ? req.body : '{}');
    try {
      const newData = await clientService.editClient(id, data);
      if (validators.isPublicClient(newData)) {
        responseHandlers.setHeaderJson(res);
        responseHandlers.setStatus(200, res);
        res.end(JSON.stringify(newData));
      } else {
        throw new ControllerError(500);
      }
    } catch (error) {
      logger.debugError(`${this.controllerName} - editClient()`, error);
      if (error instanceof ControllerError) {
        throw error;
      } else {
        throw new ControllerError(500);
      }
    }
  }

  /*
   * This function allows getting client-data 
   */
  async getClient(req: HttpRequest, res: HttpResponse) {
    const id = req.url?.substring(9) || '';
    if (id.length > 1) {
      const client = await clientService.getClient(id);
      if (client && validators.isPublicClient(client)) {
        responseHandlers.setCors(res, req.headers.origin);
        responseHandlers.setHeaderJson(res);
        responseHandlers.setStatus(200, res);
        res.end(JSON.stringify(client));
      } else {
        throw new ControllerError(404, 'client not found');
      }
    } else {
      throw new ControllerError(404, 'invalid client id');
    }
  }
}

