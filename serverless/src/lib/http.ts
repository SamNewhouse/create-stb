import { APIGatewayProxyResult } from "aws-lambda";
import axios, { AxiosResponse, AxiosError } from "axios";

/**
 * Standardized API response body structure
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Default CORS headers applied to all HTTP responses
 */
const defaultHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
};

/**
 * Default Axios instance with common configuration
 */
const httpClient = axios.create({
  timeout: 30000, // 30 second timeout
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Creates a successful HTTP response with data
 * @param data - The response data payload
 * @param statusCode - HTTP status code (defaults to 200)
 * @param message - Optional success message
 * @returns Formatted HTTP response as APIGatewayProxyResult
 */
export function success<T>(data: T, statusCode = 200, message?: string): APIGatewayProxyResult {
  const response: ApiResponse<T> = {
    success: true,
    data,
    ...(message && { message }),
  };

  return {
    statusCode,
    headers: defaultHeaders,
    body: JSON.stringify(response),
  };
}

/**
 * Creates an error HTTP response
 * @param errorMessage - Error message to return
 * @param statusCode - HTTP status code (defaults to 500)
 * @returns Formatted HTTP error response as APIGatewayProxyResult
 */
export function error(errorMessage: string, statusCode = 500): APIGatewayProxyResult {
  const response: ApiResponse = {
    success: false,
    error: errorMessage,
  };

  return {
    statusCode,
    headers: defaultHeaders,
    body: JSON.stringify(response),
  };
}

/**
 * Creates a 400 Bad Request response
 * @param errorMessage - Error message describing what was invalid
 * @returns HTTP 400 response as APIGatewayProxyResult
 */
export function badRequest(errorMessage: string): APIGatewayProxyResult {
  return error(errorMessage, 400);
}

/**
 * Creates a 401 Unauthorized response
 * @param errorMessage - Error message (defaults to "Unauthorized")
 * @returns HTTP 401 response as APIGatewayProxyResult
 */
export function unauthorized(errorMessage: string = "Unauthorized"): APIGatewayProxyResult {
  return error(errorMessage, 401);
}

/**
 * Creates a 403 Forbidden response
 * @param errorMessage - Error message (defaults to "Forbidden")
 * @returns HTTP 403 response as APIGatewayProxyResult
 */
export function forbidden(errorMessage: string = "Forbidden"): APIGatewayProxyResult {
  return error(errorMessage, 403);
}

/**
 * Creates a 404 Not Found response
 * @param errorMessage - Error message (defaults to "Not Found")
 * @returns HTTP 404 response as APIGatewayProxyResult
 */
export function notFound(errorMessage: string = "Not Found"): APIGatewayProxyResult {
  return error(errorMessage, 404);
}

/**
 * Creates a 409 Conflict response
 * @param errorMessage - Error message describing the conflict
 * @returns HTTP 409 response as APIGatewayProxyResult
 */
export function conflict(errorMessage: string): APIGatewayProxyResult {
  return error(errorMessage, 409);
}

/**
 * Safely parses JSON request body with error handling
 * @param body - Raw request body string from API Gateway event
 * @returns Parsed JSON object
 * @throws Error if body is null/empty or contains invalid JSON
 */
export function parseBody<T = any>(body: string | null): T {
  if (!body) {
    throw new Error("Request body is required");
  }

  try {
    return JSON.parse(body);
  } catch {
    throw new Error("Invalid JSON in request body");
  }
}

/**
 * Makes an HTTP GET request using Axios
 * @param url - The URL to make the GET request to
 * @param headers - Optional additional headers
 * @returns Promise resolving to the response data
 */
export async function get<T = any>(url: string, headers?: Record<string, string>): Promise<T> {
  try {
    const response: AxiosResponse<T> = await httpClient.get(url, { headers });
    return response.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}

/**
 * Makes an HTTP POST request using Axios
 * @param url - The URL to make the POST request to
 * @param data - The data to send in the request body
 * @param headers - Optional additional headers
 * @returns Promise resolving to the response data
 */
export async function post<T = any>(
  url: string,
  data?: any,
  headers?: Record<string, string>,
): Promise<T> {
  try {
    const response: AxiosResponse<T> = await httpClient.post(url, data, { headers });
    return response.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}

/**
 * Makes an HTTP PUT request using Axios
 * @param url - The URL to make the PUT request to
 * @param data - The data to send in the request body
 * @param headers - Optional additional headers
 * @returns Promise resolving to the response data
 */
export async function put<T = any>(
  url: string,
  data?: any,
  headers?: Record<string, string>,
): Promise<T> {
  try {
    const response: AxiosResponse<T> = await httpClient.put(url, data, { headers });
    return response.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}

/**
 * Makes an HTTP DELETE request using Axios
 * @param url - The URL to make the DELETE request to
 * @param headers - Optional additional headers
 * @returns Promise resolving to the response data
 */
export async function del<T = any>(url: string, headers?: Record<string, string>): Promise<T> {
  try {
    const response: AxiosResponse<T> = await httpClient.delete(url, { headers });
    return response.data;
  } catch (err) {
    throw handleAxiosError(err);
  }
}

/**
 * Handles Axios errors and converts them to standardized Error objects
 * @param err - The Axios error or unknown error
 * @returns A standardized Error object
 */
function handleAxiosError(err: unknown): Error {
  if (axios.isAxiosError(err)) {
    const axiosError = err as AxiosError;

    if (axiosError.response) {
      // Server responded with error status
      return new Error(`HTTP ${axiosError.response.status}: ${axiosError.response.statusText}`);
    } else if (axiosError.request) {
      // Request was made but no response received
      return new Error("Network error: No response received");
    } else {
      // Something else happened
      return new Error(`Request error: ${axiosError.message}`);
    }
  }
  return new Error("Unknown HTTP error");
}

/**
 * Converts caught errors into standardized HTTP error responses
 * Automatically maps common error types to appropriate status codes
 * @param err - The caught error (unknown type for safety)
 * @returns Formatted HTTP error response as APIGatewayProxyResult
 */
export function handleError(err: unknown): APIGatewayProxyResult {
  let errorMessage = "Unknown error";
  let statusCode = 500;

  if (err instanceof Error) {
    errorMessage = err.message;

    // Map specific error messages to appropriate status codes
    if (err.message.includes("required") || err.message.includes("Invalid JSON")) {
      statusCode = 400;
    } else if (err.message.includes("HTTP 401")) {
      statusCode = 401;
    } else if (err.message.includes("HTTP 403")) {
      statusCode = 403;
    } else if (err.message.includes("HTTP 404")) {
      statusCode = 404;
    } else if (err.message.includes("Network error")) {
      statusCode = 503; // Service Unavailable
    }
  }

  return error(errorMessage, statusCode);
}

// Export the configured Axios instance for advanced usage
export { httpClient };
