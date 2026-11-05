export const API_URL = process.env.REACT_APP_API_URL;

// The API sends validation errors as JSON:API errors and other errors as { message }.
export function apiErrorMessage(error) {
  const data = error.response?.data;

  return data?.errors?.[0]?.detail ?? data?.message ?? error.message;
}
