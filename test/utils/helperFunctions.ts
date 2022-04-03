/*
 * These are helpers to avoid writing same code over and over again
 */

import { Controller, HttpRequest, HttpResponse } from '../../src/types';
import { ControllerError } from '../../src/utils/customErrors';

// this just lists possible Content-Types:
type ContentType = 'text/html' | 'application/json';

export const verify200isReturned = (_req: HttpRequest, res: HttpResponse, type: ContentType, content?: string | undefined) => {
  // writehead needs to be called once
  expect(res.writeHead).toBeCalledTimes(1);
  // and it should have been called with 200
  expect(res.writeHead).toBeCalledWith(200);
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

export const verify404isReturned = async (req: HttpRequest, res: HttpResponse, controller: Controller) => {
  let success = false;
  try {
    // This SHOULD fail and throw us a ControllerError
    await controller.handleRequest(req, res);
  } catch (error) {
    expect(error).toBeInstanceOf(ControllerError);
    if (error instanceof ControllerError) {
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('not found');
      // we did receive ControllerError and managed to tests it against expected values
      success = true;
    }
  } finally {
    // this is just to make sure we don't silently fail in case no ControllerError was thrown.
    expect(success).toBe(true);
    if (!success) {
      expect('failed: ').toBe(controller.controllerName);
    }
  }
};