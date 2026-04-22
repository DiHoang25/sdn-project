import axios from "axios";

export const API_BASE_URL =
 
  "https://robena-nonapparitional-knox.ngrok-free.dev";

export const STORAGE_KEY = "quiz-master-auth";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

let currentAuthToken = null;
let authFailureHandler = null;

export function setAuthToken(token) {
  currentAuthToken = token || null;
}

export function registerAuthFailureHandler(handler) {
  authFailureHandler = handler;
}

apiClient.interceptors.request.use((config) => {
  if (currentAuthToken) {
    let latestStoredToken = null;

    try {
      const rawAuth = localStorage.getItem(STORAGE_KEY);
      if (rawAuth) {
        const parsedAuth = JSON.parse(rawAuth);
        latestStoredToken = parsedAuth?.token ?? null;
      }
    } catch (error) {
      latestStoredToken = null;
    }

    if (latestStoredToken !== currentAuthToken) {
      const mismatchMessage = "403 Forbidden: Session token changed in another tab. Please login again.";
      if (authFailureHandler) {
        authFailureHandler({ status: 403, message: mismatchMessage });
      }

      const mismatchError = new Error(mismatchMessage);
      mismatchError.response = {
        status: 403,
        data: { message: mismatchMessage },
      };
      return Promise.reject(mismatchError);
    }
  }

  if (currentAuthToken) {
    config.headers.Authorization = `Bearer ${currentAuthToken}`;
  } else if (config.headers?.Authorization) {
    delete config.headers.Authorization;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    // 403 from business authorization (not owner/admin) should not force logout.
    // Only 401 should invalidate current session automatically.
    if (status === 401 && currentAuthToken && authFailureHandler) {
      authFailureHandler({
        status,
        message: error?.response?.data?.message || error?.response?.data?.error || null,
      });
    }

    return Promise.reject(error);
  }
);

export function getApiErrorMessage(error, fallbackMessage = "Request failed") {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.response?.data?.error) {
    return error.response.data.error;
  }

  if (error?.message) {
    return error.message;
  }

  return fallbackMessage;
}