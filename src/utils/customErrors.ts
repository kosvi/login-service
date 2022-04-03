import { StatusCode } from '../types';

export class ControllerError extends Error {
  // statuscode is always set!
  statusCode!: StatusCode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(statusCode: StatusCode, ...params: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    super(...params);
    this.name = 'ControllerError';
    this.statusCode = statusCode;
  }
}