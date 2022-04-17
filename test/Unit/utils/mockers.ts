import { HttpResponse } from '../../../src/types';

export const mockResponse = (): HttpResponse => {
  const res = {
    setHeader: jest.fn(),
    writeHead: jest.fn(),
    end: jest.fn()
  };
  return res;
};