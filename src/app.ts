import { PORT } from './utils/config';
import { logger } from './utils/logger';
import { HelloController } from './controllers/hello';

import { createServer as HttpCreateServer } from 'http';

const server = HttpCreateServer((req, res) => {
  if (req.url?.startsWith('/hello')) {
    const controller = new HelloController();
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
