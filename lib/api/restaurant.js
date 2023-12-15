import sendRequest from './sendRequest';
import sendRequestWithFile from './sendRequestWithFile';

const BASE_PATH = '/api/v1/restaurant';

export const fetchRestaurant = ({ id }) =>
  sendRequest(`${BASE_PATH}/fetch/${id}`, {
    method: 'GET',
  });

export const fetchRestaurantImages = data =>
  sendRequest(`${BASE_PATH}/restaurant_images`, {
    body: JSON.stringify(data),
  });

export const fetchRelatedPlaces = data =>
  sendRequest(`${BASE_PATH}/restaurant_places`, {
    body: JSON.stringify(data),
  });

export const fetchSliderImages = ({ id }) =>
  sendRequest(`${BASE_PATH}/slider_images/${id}`, {
    method: 'GET',
  });

export const fetchCertificates = ({ id }) =>
  sendRequest(`${BASE_PATH}/certificates/${id}`, {
    method: 'GET',
  });

export const fetchMenu = ({ id }) =>
  sendRequest(`${BASE_PATH}/menu/${id}`, {
    method: 'GET',
  });

export const fetchEvents = ({ id }) =>
  sendRequest(`${BASE_PATH}/events/${id}`, {
    method: 'GET',
  });

export const filterRestaurants = data =>
  sendRequest(`${BASE_PATH}/filterRestaurant`, {
    body: JSON.stringify(data),
  });

export const submitReview = data =>
  sendRequest(`${BASE_PATH}/submit_review`, {
    body: JSON.stringify(data),
  });

export const updateReview = data =>
  sendRequest(`${BASE_PATH}/update_review`, {
    body: JSON.stringify(data),
  });

export const bookmark = data =>
  sendRequest(`${BASE_PATH}/bookmark`, {
    body: JSON.stringify(data),
  });

export const markvisited = data =>
  sendRequest(`${BASE_PATH}/visited`, {
    body: JSON.stringify(data),
  });

export const fetchAdditionalDetails = ({ restaurant_id, user_id }) =>
  sendRequest(`${BASE_PATH}/additional_details/${restaurant_id}/${user_id}`, {
    method: 'GET',
  });

export const fetchReviews = ({ restaurant_id, page }) =>
  sendRequest(`${BASE_PATH}/reviews/${restaurant_id}/${page}`, {
    method: 'GET',
  });

export const useful = ({ review_id, user_id }) =>
  sendRequest(`${BASE_PATH}/review/useful/${review_id}/${user_id}`, {
    method: 'GET',
  });

export const not_useful = ({ review_id, user_id }) =>
  sendRequest(`${BASE_PATH}/review/not_useful/${review_id}/${user_id}`, {
    method: 'GET',
  });

export const website_click = ({ restaurant_id }) =>
  sendRequest(`${BASE_PATH}/restaurant/website_click/${restaurant_id}`, {
    method: 'GET',
  });

export const cellphone_click = ({ restaurant_id }) =>
  sendRequest(`${BASE_PATH}/restaurant/cellphone_click/${restaurant_id}`, {
    method: 'GET',
  });

export const email_click = ({ restaurant_id }) =>
  sendRequest(`${BASE_PATH}/restaurant/email_click/${restaurant_id}`, {
    method: 'GET',
  });

export const saveReviewImages = data =>
  sendRequestWithFile(`${BASE_PATH}/savereviewimages`, {
    body: data,
  });