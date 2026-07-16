export async function fetchJson(url) {
  const response = await fetch(url);

  const data = await response
    .json()
    .catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.error || `Request failed: ${response.status}`
    );
  }

  return data;
}