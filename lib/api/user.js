import sendRequest from './sendRequest';
import sendRequestWithFile from './sendRequestWithFile';

const BASE_PATH = '/api/v1/user';

export const signup = data =>
  sendRequest(`${BASE_PATH}/signup`, {
    body: JSON.stringify(data),
  });

export const sendOtpMail = data =>
  sendRequest(`${BASE_PATH}/sendotpmail`, {
    body: JSON.stringify(data),
  });

export const sendotp = data =>
  sendRequest(`${BASE_PATH}/sendotp`, {
    body: JSON.stringify(data),
  });

export const profileSendOTP = data =>
  sendRequest(`${BASE_PATH}/profile/sendotp`, {
    body: JSON.stringify(data),
  });

export const verifyotp = data =>
  sendRequest(`${BASE_PATH}/verifyotp`, {
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

export const saveProfile = data =>
  sendRequest(`${BASE_PATH}/saveprofile`, {
    body: JSON.stringify(data),
  });

export const saveProfileImage = data =>
  sendRequestWithFile(`${BASE_PATH}/saveprofileimage`, {
    body: data,
  });

export const resetpassword = data =>
  sendRequest(`${BASE_PATH}/resetpassword`, {
    body: JSON.stringify(data),
  });

export const addListing = data =>
  sendRequest(`${BASE_PATH}/addlisting`, {
    body: JSON.stringify(data),
  });

export const fetchBookmarkedRestaurants = data =>
  sendRequest(`${BASE_PATH}/bookmarkedRestaurants`, {
    body: JSON.stringify(data),
  });

export const removeBookmark = data =>
  sendRequest(`${BASE_PATH}/removeBookmark`, {
    body: JSON.stringify(data),
  });

export const fetchMyReviews = data =>
  sendRequest(`${BASE_PATH}/myReviews`, {
    body: JSON.stringify(data),
  });

export const removeReview = data =>
  sendRequest(`${BASE_PATH}/removeReview`, {
    body: JSON.stringify(data),
  });

export const subscribe = data =>
  sendRequest(`${BASE_PATH}/subscribe`, {
    body: JSON.stringify(data),
  });

export const checkClient = data =>
  sendRequest(`${BASE_PATH}/checkclient`, {
    body: JSON.stringify(data),
  });