import 'isomorphic-unfetch';
import getRootUrl from './getRootUrl';
import Router from 'next/router';

export default async function sendRequest(path, opts = {}) {
  var headers = Object.assign({}, opts.headers || {}, {
    'Content-type': 'application/json; charset=UTF-8',
  });

  var accessToken = window.localStorage.getItem("accessToken");
  if(accessToken){
    headers = Object.assign({}, headers || {}, {
      'x-access-token': accessToken,
    });
  }

  const response = await fetch(
    `${getRootUrl()}${path}`,
    Object.assign({ method: 'POST', credentials: 'same-origin' }, opts, { headers }),
  );

  const data = await response.json();

  if (data.error) {
    // throw new Error(data.error);
    Router.push('/logout');
    return false;
  } else{
    return data;
  }

  // return data;
}
