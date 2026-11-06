export const API_URL = import.meta.env.VITE_API_URL;

// The API sends validation errors as JSON:API errors, a failed login as { error } and other errors as { message }.
// With no response at all (offline, API down) it falls back to the request's own message.
export function apiErrorMessage(error) {
  const data = error.response?.data;

  return data?.errors?.[0]?.detail ?? data?.error ?? data?.message ?? error.message;
}

// Turns the table's sorting state into the API's sort parameter: [{ id: "name", desc: true }] becomes "-name".
export function toApiSort(sorting) {
  return sorting.map((sort) => (sort.desc ? `-${sort.id}` : sort.id)).join(",");
}
