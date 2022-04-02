import { IncomingMessage, ServerResponse } from 'http';

/*
 * Every single Controller has to implement this interface so that
 * our server knows how to use the Controller
 */
export interface Controller {
  // handleRequest is the method that takes care of the request and handles the response
  handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void>,
  // this is just in case we want to know what controller we are using
  controllerName: string
}