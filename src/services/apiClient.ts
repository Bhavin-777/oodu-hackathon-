// src/services/apiClient.ts
//
// Thin axios wrapper shared by every service module in the app. Kept out of
// the "owned files" list on purpose — this should already exist as a shared
// util owned by whoever set up auth (RBAC/login). If it doesn't exist yet in
// the repo, drop this file in as-is; it only assumes a JWT is stored after
// login, which is the standard pattern for the RBAC requirement in the spec.

import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the auth token (set by the login/RBAC flow) to every request.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('transitops_token');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Surface backend validation errors (e.g. "cargo exceeds capacity") in a
// consistent shape so components can just read err.message.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ??
      error?.message ??
      'Unexpected network error';
    return Promise.reject(new Error(message));
  }
);
