import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;
// const API_URL = "https://192.168.1.11:3000/api/admin";
// const API_URL = 'https://testapi.apnamandal.com/api';
// const API_URL = 'http://192.168.1.10:3000/api';

// Create a custom event for loading state
const LOADING_EVENT = "api-loading-state";

// Function to dispatch loading state
const setLoading = (isLoading) => {
  window.dispatchEvent(
    new CustomEvent(LOADING_EVENT, { detail: { isLoading } })
  );
};

// Add request interceptor to show loader
axios.interceptors.request.use(
  (config) => {
    setLoading(true);
    return config;
  },
  (error) => {
    setLoading(false);
    return Promise.reject(error);
  }
);

// Add response interceptor to hide loader
axios.interceptors.response.use(
  (res) => {
    setLoading(false);
    return res;
  },
  (err) => {
    // console.log(err?.response?.data?.message)
    setLoading(false);
    throw new Error(err?.response?.data?.message);
  }
);

class HttpService {
  get(url, params = {}, customHeaders = {}) {
    return call("GET", url, params, customHeaders);
  }

  post(url, params = {}, payload = {}, customHeaders = {}) {
    return call("POST", url, params, payload, customHeaders);
  }

  delete(url, params = {}, payload = {}, customHeaders = {}) {
    return call("DELETE", url, params, payload, customHeaders);
  }

  put(url, params = {}, payload = {}, customHeaders = {}) {
    return call("PUT", url, params, payload, customHeaders);
  }
}
function call(method, URL, params, payload = {}, customHeaders = {}) {
  const defaultHeaders = {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  const opts = {
    method,
    url: API_URL + URL,
    headers: { ...defaultHeaders, ...customHeaders },
  };

  if (params) opts.params = params;
  if (payload) opts.data = payload;

  // If payload is FormData, remove Content-Type (let Axios set it)
  if (payload instanceof FormData) {
    delete opts.headers["Content-Type"];
  } else {
    opts.headers["Content-Type"] = "application/json";
  }

  return axios(opts);
}

export default new HttpService();
