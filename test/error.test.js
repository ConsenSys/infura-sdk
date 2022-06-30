import { networkErrorHandler } from '../src/lib/error/handler';

describe('handlerError', () => {
  const networkError = {
    reason: 'cannot estimate gas; transaction may fail or may require manual gas limit',
    code: 'UNPREDICTABLE_GAS_LIMIT',
  };
  const unknownError = 'unknown error';
  it('should return error with message and code', () => {
    const result = networkErrorHandler(networkError);

    expect(result).toEqual(`code: ${networkError.code}, message: ${networkError.reason}`);
  });

  it('should return unknown error', () => {
    const result = networkErrorHandler(unknownError);
    expect(result).toEqual(`code: UNKNOWN_ERROR, message: ${unknownError}`);
  });
});