import { PORT } from './utils/config';
import { logger } from './utils/logger';
import { HelloController } from './controllers/hello';

import { createServer as HttpCreateServer } from 'http';
import { Controller } from './types';

const server = HttpCreateServer((req, res) => {
  let controller: Controller | undefined;
  if (req.url?.startsWith('/hello')) {
    controller = new HelloController();
  }
  if (controller) {
    controller.handleRequest(req, res)
      .then(_result => {
        logger.log('hello handled');
      })
      .catch(_error => {
        logger.error('hello failed');
      });
  }
});

server.listen(PORT, () => {
  logger.log(`server started on port ${PORT}`);
});
