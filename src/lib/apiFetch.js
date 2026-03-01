export async function apiFetch(endpoint, options) {
  const response = await fetch(endpoint, options);

  if (!response.ok) {
    throw new Error("API Error");
  }

  return response.json();
}
