/*
 * These are helpers to avoid writing same code over and over again
 */

import { Controller, HttpRequest, HttpResponse, StatusCode } from '../../../src/types';
import { ControllerError } from '../../../src/utils/customErrors';

/*
 * Here is the helpers for testing if our controller has 
 * formed a correct response to the request
 * 
 * Available helpers:
 *  - verify 200 is returned
 *  - verify 401 is thrown
 *  - verify 404 is thrown
 * 
 * response type (text/html or application/json) can be defined as param
 * also content body can be tested if body is sent with response
 */

// this just lists possible Content-Types:
type ContentType = 'text/html' | 'application/json';

const verifyWhatIsReturned = (res: HttpResponse, type: ContentType, status: StatusCode, content?: string) => {
  // writehead needs to be called once
  expect(res.writeHead).toBeCalledTimes(1);
  // and it should have been called with 200
  expect(res.writeHead).toBeCalledWith(status);
  // header is set once
  expect(res.setHeader).toBeCalledTimes(1);
  // and it should be of type 'type'
  expect(res.setHeader).toBeCalledWith('Content-Type', type);
  // end is called once
  expect(res.end).toBeCalledTimes(1);
  // .. with content (if set)
  if (content) {
    expect(res.end).toBeCalledWith(content);
  }
};

export const verify200isReturned = (_req: HttpRequest, res: HttpResponse, type: ContentType, content?: string | undefined) => {
  if (content) {
    verifyWhatIsReturned(res, type, 200, content);
  } else {
    verifyWhatIsReturned(res, type, 200);
  }
};

const verifyWhatIsThrown = async (req: HttpRequest, res: HttpResponse, controller: Controller, status: StatusCode, message?: string | undefined) => {
  let success = false;
  try {
    // This SHOULD fail and throw us a ControllerError
    await controller.handleRequest(req, res);
  } catch (error) {
    expect(error).toBeInstanceOf(ControllerError);
    if (error instanceof ControllerError) {
      expect(error.statusCode).toBe(status);
      if (message) {
        expect(error.message).toBe(message);
      }
      // we did receive ControllerError and managed to tests it against expected values
      success = true;
    }
  } finally {
    // this is just to make sure we don't silently fail in case no ControllerError was thrown.
    // Please notice, that we may have failed in any of the above expects (debug which failed if needed)
    expect(success).toBe(true);
    if (!success) {
      expect('failed: ').toBe(controller.controllerName);
    }
  }

};

export const verify401isThrown = async (req: HttpRequest, res: HttpResponse, controller: Controller, message?: string | undefined) => {
  await verifyWhatIsThrown(req, res, controller, 401, message);
};

export const verify404isThrown = async (req: HttpRequest, res: HttpResponse, controller: Controller) => {
  await verifyWhatIsThrown(req, res, controller, 404, 'not found');
};

/*
 * This helper return true if promise is rejected and error message equals 'message',
 * else false is returned
 */
export async function verifyAsyncThrows<T>(promise: Promise<T>, message: string): Promise<boolean> {
  try {
    await promise;
  } catch (error) {
    if (error instanceof Error && error.message === message) {
      return true;
    }
  }
  return false;
}