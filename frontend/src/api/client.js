const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

function extractMessage(data) {
  if (!data) return "Request failed";
  if (typeof data === "string") return data;
  if (typeof data.detail === "string") return data.detail;
  if (Array.isArray(data.detail)) {
    return data.detail
      .map((e) => {
        const field = (e.loc || []).slice(1).join(".");
        return field ? `${field}: ${e.msg}` : e.msg;
      })
      .join("\n");
  }
  return JSON.stringify(data);
}

export async function api(path, { method = "GET", body } = {}) {
  const headers = {};
  const token = localStorage.getItem("token");
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Cannot reach the server. Is the FastAPI backend running?", 0);
  }

  if (
    res.status === 401 &&
    !path.startsWith("/login") &&
    !path.startsWith("/register")
  ) {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("auth:expired"));
  }

  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) throw new ApiError(extractMessage(data), res.status);
  return data;
}
