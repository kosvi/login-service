import { HelloService } from '../services/hello';
import { IncomingMessage, ServerResponse } from 'http';
import { logger } from '../utils/logger';

export class HelloController {

  async handleRequest(req: IncomingMessage, res: ServerResponse) {
    if (req.url === '/hello' && req.method === 'GET') {
      await this.getHello(req, res);
    }
  }

  async getHello(_req: IncomingMessage, res: ServerResponse) {
    const hello = new HelloService();
    try {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      const content = await hello.sayHello();
      res.end(JSON.stringify(content));
    } catch (_error) {
      logger.error('error in sayHello()');
    }
  }
}