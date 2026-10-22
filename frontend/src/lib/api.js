const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

export async function apiRequest(path, options = {}) {
  const { auth = false, ...requestOptions } = options;
  const headers = new Headers(requestOptions.headers || {});
  headers.set("Accept", "application/json");

  if (requestOptions.body && (typeof FormData === "undefined" || !(requestOptions.body instanceof FormData))) {
    headers.set("Content-Type", "application/json");
  }

  if (auth && typeof window !== "undefined") {
    const token = window.localStorage.getItem("token");
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`, {
      ...requestOptions,
      headers,
    });
  } catch {
    throw new Error("FoodBridge is temporarily unreachable. Check that the API server is running.");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed (${response.status})`);
  }

  return data;
}
