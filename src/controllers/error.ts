/* 
 * This class is simply used if no other matches the request
 * We simply throw a ControllerError here that states 404
 */

import { Controller, HttpRequest, HttpResponse } from '../types';
import { ControllerError } from '../utils/customErrors';

export class ErrorController implements Controller {

  controllerName = 'ErrorController';

  handleRequest(_req: HttpRequest, _res: HttpResponse): Promise<void> {
    throw new ControllerError(404, 'not found');
  }
}