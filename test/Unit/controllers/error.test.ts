import { ControllerError } from '../../../src/utils/customErrors';
import { ErrorController } from '../../../src/controllers';
import { mockResponse } from '../utils/mockers';
import { HttpRequest } from '../../../src/types';

describe('ErrorController tests', () => {
  it('should always throw ControllerError', async () => {
    const c = new ErrorController();
    const req: HttpRequest = { url: '/', method: 'GET', headers: {} };
    const res = mockResponse();
    let success = false;
    try {
      await c.handleRequest(req, res);
    } catch (error) {
      expect(error).toBeInstanceOf(ControllerError);
      if (error instanceof ControllerError) {
        success = true;
      }
    } finally {
      expect(success).toBe(true);
    }
  });
});