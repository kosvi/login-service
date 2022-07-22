import { mockResponse } from './mockers';
import { responseHandlers } from '../../../src/utils/responseHandlers';
import { FRONTEND_URL } from '../../../src/utils/config';

// mock database-service to return what we want it to return
jest.mock('../../../src/services', () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const originalServices = jest.requireActual('../../../src/services');
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    ...originalServices,
    db: {
      findHost: jest.fn()
    }
  };
});


describe('responseHandlers tests', () => {

  it('shouldn\'t update headers for invalid origin', async () => {
    const res = mockResponse();
    await responseHandlers.setCors(res, 'http://invalid.example.com');
    // no calls to setHeader should happen
    expect(res.setHeader).toHaveBeenCalledTimes(0);
  });
  it('should update headers for correct origin', async () => {
    const res = mockResponse();
    await responseHandlers.setCors(res, FRONTEND_URL);
    // should be called 3 times: Origin, Methods, Headers
    expect(res.setHeader).toHaveBeenCalledTimes(3);
    expect((res.setHeader as jest.Mock).mock.calls).toEqual([
      ['Access-Control-Allow-Origin', FRONTEND_URL],
      ['Access-Control-Allow-Methods', 'OPTIONS, POST'],
      ['Access-Control-Allow-Headers', 'Content-Type']
    ]);
  });
});
