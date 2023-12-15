import sendRequest from './sendRequest';
import sendRequestWithFile from './sendRequestWithFile';

const BASE_PATH = '/api/v1/home';

export const filterTemplates = data =>
  sendRequest(`${BASE_PATH}/filterTemplates`, {
    body: JSON.stringify(data),
  });

export const filterMostTrusted = data =>
  sendRequest(`${BASE_PATH}/filterMostTrusted`, {
    body: JSON.stringify(data),
  });

export const filterRestaurants = data =>
  sendRequest(`${BASE_PATH}/filterRestaurant`, {
    body: JSON.stringify(data),
  });

export const filterVenues = data =>
  sendRequest(`${BASE_PATH}/filterVenues`, {
    body: JSON.stringify(data),
  });

export const fetchBlogs = data =>
  sendRequest(`${BASE_PATH}/fetchBlogs`, {
    body: JSON.stringify(data),
  });

export const saveInterestedEmails = data =>
  sendRequest(`${BASE_PATH}/saveInterestedEmails`, {
    body: JSON.stringify(data),
  });