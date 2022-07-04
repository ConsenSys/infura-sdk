/* eslint-disable */
import { ERROR_MESSAGE, ERROR_LOCATION } from '../errorMessages';

export const networkErrorHandler = error => {
  if (error['code'] !== undefined && error['reason'] !== undefined) {
    return `code: ${error.code}, message: ${error.reason}`;
  }
  return `code: UNKNOWN_ERROR, message: ${error}`;
};

export const ERROR_LOG = {
  message: ERROR_MESSAGE,
  location: ERROR_LOCATION,
};
export const errorLogger = ({ location, message, options = '' }) =>
  `${location} ${message}${options && options.length > 0 ? ' | ' + options : ''}`;
