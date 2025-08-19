export const API_BASE = "http://localhost:3000";

export const apiFetch = async (path: string, options: RequestInit = {}): Promise<Response> => {
  const fullUrl = new URL(path, API_BASE);
  const { headers, ...otherOptions } = options;

  return fetch(fullUrl, {
    credentials: "include", // 👈 важливо для куки
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
    },
    ...otherOptions,
  });
};
