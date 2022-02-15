// A tiny wrapper around fetch(), borrowed from
// https://kentcdodds.com/blog/replace-axios-with-a-simple-custom-fetch-wrapper

import { settings } from '../config';

/**
 * Client I stole this from a react tutorial
 */
export async function client(endpoint, method, { body, ...customConfig } = {}) {
  const headers = { 'Content-Type': 'application/json' }

  // Attempt Http basic auth if we got credentials
  let authHeaders = {}
  if (settings.opencast.name && settings.opencast.password) {
    const encoded = btoa(unescape(encodeURIComponent(
      settings.opencast.name + ":" + settings.opencast.password
    )));
    authHeaders = { 'Authorization': `Basic ${encoded}` };
  }

  const config = {
    method: method,
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
      ...authHeaders,
    },
  }

  if (body) {
    config.body = JSON.stringify(body)
  }

  let data
  let text
  let response
  try {
    response = await window.fetch(endpoint, config)
    text = await response.text()

    if (response.url.includes("login.html")) {
      throw new Error("Got redirected to login page, authentification failed.")
    }

    if (response.ok) {
      text.length ? data = JSON.parse(text) : data = ''
      return data
    }
    throw new Error(response.statusText)
  } catch (err) {
    return Promise.reject(response.status ?
        "Status " + response.status + ": " + text :
        err.message
      )
  }
}

client.lock = function (endpoint, body, customConfig = {}) {
  return client(endpoint, 'POST', { ...customConfig })
}

client.refresh = function (endpoint, customConfig = {}) {
  return client(endpoint, 'POST', { ...customConfig })
}

client.release = function (endpoint, customConfig = {}) {
  return client(endpoint, 'DELETE', { ...customConfig })
}

client.get = function (endpoint, customConfig = {}) {
  return client(endpoint, 'GET', { ...customConfig})
}

client.post = function (endpoint, body, customConfig = {}) {
  return client(endpoint, 'POST', {body, ...customConfig})
}

client.startLock = function (endpoint, body, delay, customConfig = {}) {
  client.lock(endpoint, body, customConfig);
  body.lockRefresh = true;
  useInterval( async () => {
    const refreshLock = await client.refresh(endpoint,body, customConfig)
  }, delay);
}