import { HttpService } from '../services/httpService';

// Constant
const BASEURL = 'http://base.url.com';
const APIKEY = 'APIKEY';

// Mock Endpoint
const pushHttpService = jest.spyOn(HttpService.prototype, 'post').mockImplementation(() => {});
const gethHttpService = jest.spyOn(HttpService.prototype, 'get').mockImplementation(() => {
  return { status: 200 };
});

describe('httpService', () => {
  it('should throw when args are missing (baseURL)', async () => {
    expect(() => {
      const instance = new HttpService(null, APIKEY);
    }).toThrow('[httpService.constructor] baseURL is missing!');
  });

  it('should throw when args are missing (apiKey)', async () => {
    expect(() => {
      const instance = new HttpService(BASEURL, null);
    }).toThrow('[httpService.constructor] apiKey is missing!');
  });

  it('should GET using axios', async () => {
    const instance = new HttpService(BASEURL, APIKEY);
    const res = await instance.get('/api/people/1');
    expect(gethHttpService).toHaveBeenCalled();
    expect(res.status).toBe(200);
  });

  it('should POST using axios', async () => {
    const instance = new HttpService(BASEURL, APIKEY);
    const res = await instance.post('/api/people/1');
    expect(pushHttpService).toHaveBeenCalled();
  });
});