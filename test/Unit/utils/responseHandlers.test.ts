import { db } from '../../../src/services';
import { mockResponse } from './mockers';
import { responseHandlers } from '../../../src/utils/responseHandlers';

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
  it('shouldn\'t update headers for non-whitelisted sites', () => {
    // write this test!
    expect(true).toBe(true);
  });
  it('should update headers for whitelisted sites', async () => {
    (db.findHost as jest.Mock).mockResolvedValueOnce({ id: 1, name: 'foox', host: 'http://foo.example.com', trusted: false });
    const res = mockResponse();
    await responseHandlers.setCors(res, 'http://foo.example.com');
    // should be called 3 times: Origin, Methods, Headers
    expect(res.setHeader).toHaveBeenCalledTimes(3);
    expect((res.setHeader as jest.Mock).mock.calls).toEqual([
      ['Access-Control-Allow-Origin', 'http://foo.example.com'],
      ['Access-Control-Allow-Methods', 'OPTIONS, POST'],
      ['Access-Control-Allow-Headers', 'Content-Type']
    ]);
  });
});
