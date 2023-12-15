import sendRequest from './sendRequest';
import sendRequestWithFile from './sendRequestWithFile';

const BASE_PATH = '/api/v1/contact';

export const addContactInquiry = data =>
  sendRequest(`${BASE_PATH}/add_contact_inquiry`, {
    body: JSON.stringify(data),
  });