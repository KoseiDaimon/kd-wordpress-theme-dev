// utils/handleError.js
export function handleError(error, message) {
  console.error(message, error);
  throw error;
}
