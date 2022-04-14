/* 
 * This class is simply used if no other matches the request
 * We simply throw a ControllerError here that states 404
 */

import { Controller, HttpRequest, HttpResponse } from '../types';
import { ControllerError } from '../utils/customErrors';
import { logger } from '../utils/logger';

export class ErrorController implements Controller {

  controllerName = 'ErrorController';

  handleRequest(req: HttpRequest, _res: HttpResponse): Promise<void> {
    logger.error(`${req.url}: 404 - not found`);
    throw new ControllerError(404, 'not found');
  }
}