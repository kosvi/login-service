// import utilities and CONSTANTS
import { logger } from './utils/logger';
import { PORT } from './utils/config';

// Import controllers
import { Controller } from './types';
import { ErrorController, HelloController, ProfileController } from './controllers';

// Import createServer so we can start taking in requests
import { createServer as HttpCreateServer } from 'http';
import { parsers } from './utils/parsers';
import { ControllerError } from './utils/customErrors';

/*
 * Create server and direct requests to correct Controllers
 */
const server = HttpCreateServer((request, res) => {
  // This will allow us to use async - await here
  void (async () => {
    // let's parse the request
    const req = await parsers.parseRequest(request);
    // we will initiate controller with correct Controller class depending on the requested URL
    let controller: Controller | undefined;
    if (req.url?.startsWith('/hello')) {
      controller = new HelloController();
    } else if (req.url?.startsWith('/profile')) {
      controller = new ProfileController();
    } else {
      // This is the default controller to handle unexpected requests
      controller = new ErrorController();
    }
    // if controller was initialized, we can use handleRequest to handle the request in correct way
    if (controller) {
      try {
        await controller.handleRequest(req, res);
        logger.log(`${controller?.controllerName} handled the request`);
      } catch (error) {
        // if for some reason the handleRequest failed, we want to log it
        let message = `${controller?.controllerName} failed: `;
        (error instanceof Error) ? message += error.message : message += 'unknown reason';
        logger.error(message);
        // now, we should have a ControllerError and we can simply return it
        if (error instanceof ControllerError) {
          res.writeHead(error.statusCode, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: error.message }));
        }
      }
    }
  })();
});

// Start server
server.listen(PORT, () => {
  logger.log(`server started on port ${PORT}`);
});
