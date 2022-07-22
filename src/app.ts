// import utilities and CONSTANTS
import { DEBUG_MODE, NODE_ENV } from './utils/config';
import { logger } from './utils/logger';
import { requestHandlers } from './utils/requestHandlers';

// Import controllers
import { Controller } from './types';
import { ErrorController, HelloController, ClientController, UserController, VerifyController } from './controllers';
import { ControllerError } from './utils/customErrors';

// Import createServer so we can start taking in requests
import { IncomingMessage, ServerResponse } from 'http';
import { LoginController } from './controllers/login';
import { responseHandlers } from './utils/responseHandlers';

/*
 * Create app and direct requests to correct Controllers
 */
export const app = (request: IncomingMessage, res: ServerResponse) => {

  // This will allow us to use async - await here
  void (async () => {

    // let's parse the request
    const req = await requestHandlers.parseRequest(request);

    // we will initiate controller with correct Controller class depending on the requested URL
    let controller: Controller | undefined;

    logger.log(`${req.method} - ${req.url}`);
    // first handle OPTIONS requests
    if (req.method === 'OPTIONS' && req.headers.origin) {
      await responseHandlers.setCors(res, req.headers.origin);
      logger.debug('Options : headers set if origin allowed');
      res.end();
      return;
    }
    // If request wasn't an OPTIONS request -> initialize correct controller to handle request
    if (req.url?.startsWith('/hello')) {
      controller = new HelloController();
    } else if (req.url?.startsWith('/login')) {
      controller = new LoginController();
    } else if (req.url?.startsWith('/users')) {
      controller = new UserController();
    } else if (req.url?.startsWith('/clients')) {
      controller = new ClientController();
    } else if (req.url?.startsWith('/verify')) {
      controller = new VerifyController();
    } else {
      // This is the default controller to handle unexpected requests
      controller = new ErrorController();
    }

    // if controller was initialized, we can use handleRequest to handle the request in correct way
    if (controller) {

      try {
        await controller.handleRequest(req, res);
        logger.debug(`${controller?.controllerName} handled the request`);
      } catch (error) {

        // if for some reason the handleRequest failed, we want to log it
        let message = `${controller?.controllerName} failed: `;
        (error instanceof Error) ? message += error.message : message += 'unknown reason';
        logger.error(message);

        // if we are in dev-mode, let's print stack trace
        if (DEBUG_MODE && NODE_ENV === 'dev' && error instanceof Error && error.stack) {
          res.end(`${error.stack}`);
          return;
        }

        // now, we should have a ControllerError and we can simply return it
        if (error instanceof ControllerError) {
          res.writeHead(error.statusCode, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error.message }));
        } else {
          logger.error('server encountered an unknown error');
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'unknown error' }));
        }
      }

    }

  })();

};
