// import utilities and CONSTANTS
import { logger } from './utils/logger';
import { PORT } from './utils/config';

// Import controllers
import { Controller } from './types';
import { HelloController } from './controllers/hello';

// Import createServer so we can start taking in requests
import { createServer as HttpCreateServer } from 'http';

/*
 * Create server and direct requests to correct Controllers
 */
const server = HttpCreateServer((req, res) => {
  // we will initiate controller with correct Controller class depending on the requested URL
  let controller: Controller | undefined;
  if (req.url?.startsWith('/hello')) {
    controller = new HelloController();
  }
  // if controller was initialized, we can use handleRequest to handle the request in correct way
  if (controller) {
    controller.handleRequest(req, res)
      .then(_result => {
        logger.log(`${controller?.controllerName} handled the request`);
      })
      .catch(error => {
        // if for some reason the handleRequest failed, we want to log it
        let message = `${controller?.controllerName} failed: `;
        (error instanceof Error) ? message += error.message : message += 'unknown reason';
        logger.error(message);
      });
  }
});

// Start server
server.listen(PORT, () => {
  logger.log(`server started on port ${PORT}`);
});
