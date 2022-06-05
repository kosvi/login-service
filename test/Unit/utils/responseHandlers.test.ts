import { db } from '../../../src/services';
import { mockResponse } from './mockers';
import { responseHandlers } from '../../../src/utils/responseHandlers';
import { testData } from './helperData';

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

  it('shouldn\'t update headers for non-whitelisted sites', async () => {
    // returns undefined if the host is not found from whitelist
    (db.findHost as jest.Mock).mockResolvedValueOnce(undefined);
    const res = mockResponse();
    await responseHandlers.setCors(res, testData.validWhitehost.host);
    // no calls to setHeader should happen
    expect(res.setHeader).toHaveBeenCalledTimes(0);
  });
  it('should update headers for whitelisted sites', async () => {
    (db.findHost as jest.Mock).mockResolvedValueOnce(testData.validWhitehost);
    const res = mockResponse();
    await responseHandlers.setCors(res, testData.validWhitehost.host);
    // should be called 3 times: Origin, Methods, Headers
    expect(res.setHeader).toHaveBeenCalledTimes(3);
    expect((res.setHeader as jest.Mock).mock.calls).toEqual([
      ['Access-Control-Allow-Origin', testData.validWhitehost.host],
      ['Access-Control-Allow-Methods', 'OPTIONS, POST'],
      ['Access-Control-Allow-Headers', 'Content-Type']
    ]);
  });
  it('should update trusted sites correctly', async () => {
    (db.findHost as jest.Mock).mockResolvedValueOnce({ ...testData.validWhitehost, trusted: true });
    const res = mockResponse();
    await responseHandlers.setCors(res, testData.validWhitehost.host);
    // should be called 3 times: Origin, Methods, Headers
    expect(res.setHeader).toHaveBeenCalledTimes(3);
    expect((res.setHeader as jest.Mock).mock.calls).toEqual([
      ['Access-Control-Allow-Origin', testData.validWhitehost.host],
      ['Access-Control-Allow-Methods', 'OPTIONS, POST, GET, PUT, PATCH, DELETE'],
      ['Access-Control-Allow-Headers', 'Content-Type']
    ]);
  });
});
