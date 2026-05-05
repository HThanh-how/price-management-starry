import axios from 'axios';
import { generateCorrelationId } from './correlationId';

/**
 * Axios instance pre-configured for the Price Management API.
 * Base URL points to the .NET backend API.
 * Automatically attaches Correlation ID header for request tracing.
 */
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor: attach correlation ID to every request.
// Uses a cross-context UUID generator so the app works even when served from
// a non-secure HTTP origin (where `crypto.randomUUID` is unavailable).
apiClient.interceptors.request.use((config) => {
  config.headers['X-Correlation-Id'] = generateCorrelationId();
  return config;
});

// Response interceptor: extract data from API envelope
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract error message from API envelope if available
    const apiError = error.response?.data;
    if (apiError?.message) {
      error.message = apiError.message;
    }
    return Promise.reject(error);
  }
);

export default apiClient;
