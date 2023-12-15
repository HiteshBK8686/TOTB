import sendRequest from './sendRequest';
import sendRequestWithFile from './sendRequestWithFile';

const BASE_PATH = '/api/v1/auth';

export const getBookList = () =>
  sendRequest(`${BASE_PATH}/books`, {
    method: 'GET',
  });

export const signup = data =>
  sendRequest(`${BASE_PATH}/signup`, {
    body: JSON.stringify(data),
  });

export const login = data =>
  sendRequest(`${BASE_PATH}/login`, {
    body: JSON.stringify(data),
  });

export const forgotpassword = data =>
  sendRequest(`${BASE_PATH}/forgotpassword`, {
    body: JSON.stringify(data),
  });

export const resetpassword = data =>
  sendRequest(`${BASE_PATH}/resetpassword`, {
    body: JSON.stringify(data),
  });

export const fetchProfile = ({ slug }) =>
  sendRequest(`${BASE_PATH}/profile/${slug}`, {
    method: 'GET',
  });

export const saveProfile = data =>
  sendRequest(`${BASE_PATH}/profile`, {
    body: JSON.stringify(data),
  });

export const uploadImage = data =>
  sendRequestWithFile(`${BASE_PATH}/uploadimage`, {
    body: data,
  });