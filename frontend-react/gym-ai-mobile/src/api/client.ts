import axios from "axios";
import { router } from "expo-router";

const client = axios.create({
  baseURL: "http://10.0.2.2:8080",
});

// AuthContext registers itself here so the interceptor below can clear the
// stored token without importing a React context into a plain module.
let onUnauthorized: (() => void) | null = null;

export const setUnauthorizedHandler = (handler: () => void) => {
  onUnauthorized = handler;
};

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url: string = error.config?.url ?? "";

    // /api/auth/* is unauthenticated (login/register/check-availability), so
    // a 401/403 there means "bad credentials", not "expired session" - let
    // the screen that made the call handle it instead of bouncing to login.
    if ((status === 401 || status === 403) && !url.startsWith("/api/auth/")) {
      onUnauthorized?.();
      router.replace("/login");
    }

    return Promise.reject(error);
  }
);

export default client;
