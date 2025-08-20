export const API_BASE = "http://localhost:3000";

export const apiFetch = async (path: string, options: RequestInit = {}): Promise<Response> => {
  const fullUrl = new URL(path, API_BASE);
  const { headers, ...otherOptions } = options;

  return fetch(fullUrl, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
    },
    ...otherOptions,
  });
};

export const geoFetch = async (lat: number, lon: number): Promise<object | null> => {
  const geoResearchUrl = new URL('https://nominatim.openstreetmap.org/reverse');

  geoResearchUrl.searchParams.set('lat', `${lat}`);
  geoResearchUrl.searchParams.set('lon', `${lon}`);
  geoResearchUrl.searchParams.set('format', 'json');
  geoResearchUrl.searchParams.set('accept-language', 'uk');

  const result = await fetch(geoResearchUrl);

  if (!result?.ok) {
    return null;
  }

  const response = await result.json();
  return response.address;
}
