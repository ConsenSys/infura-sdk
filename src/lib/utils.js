import { chainUrls } from './Auth/availableChains.js';

/* eslint-disable */
export const isBoolean = val =>
  typeof val === 'boolean' ||
  (typeof val === 'object' && val !== null && typeof val.valueOf() === 'boolean');

export const isValidString = variable =>
  variable !== undefined && variable !== null && variable !== '' && typeof variable === 'string';

export const isDefined = variable => variable !== undefined && variable !== null && variable !== '';

export const isURI = URI => !!URI.match(/^(ipfs|http|https):\/\//gi);

export const formatRpcUrl = ({ chainId, projectId }) => {
  return `${chainUrls[chainId]}/v3/${projectId}`;
};
