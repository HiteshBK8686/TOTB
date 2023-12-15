import sendRequest from './sendRequest';
import sendRequestWithFile from './sendRequestWithFile';

const BASE_PATH = '/api/v1/list';

export const filterRestaurant = data =>
  sendRequest(`${BASE_PATH}/filterRestaurant`, {
    body: JSON.stringify(data),
  });

export const searchMap = data =>
  sendRequest(`${BASE_PATH}/searchMap`, {
    body: JSON.stringify(data),
  });