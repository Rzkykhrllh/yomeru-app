const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Helper to get auth headers with Clerk session token
const getAuthHeaders = async (): Promise<Record<string, string>> => {
  try {
    // Dynamically import to avoid SSR issues
    const { useAuth } = await import("@clerk/nextjs");
    // Note: getToken must be called from within a React context.
    // For module-level usage, we rely on the token being passed explicitly.
    return {};
  } catch {
    return {};
  }
};

// Fetcher for SWR — accepts a token via a tuple key [url, token]
export const fetcher = async <T>(url: string, token?: string): Promise<T> => {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${url}`, { headers });

  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.");
    (error as any).info = await res.json().catch(() => ({}));
    (error as any).status = res.status;
    throw error;
  }

  return res.json();
};

// async function to post JSON data to a given URL and return the response as type T
export const postJson = async <T>(url: string, data: any, token?: string): Promise<T> => {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${url}`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = new Error("An error occurred while posting the data.");
    (error as any).info = await res.json().catch(() => ({}));
    (error as any).status = res.status;
    throw error;
  }

  return res.json();
};

export const putJson = async <T>(url: string, data: any, token?: string): Promise<T> => {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${url}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = new Error("An error occurred while putting the data.");
    (error as any).info = await res.json().catch(() => ({}));
    (error as any).status = res.status;
    throw error;
  }

  return res.json();
};

export const deleteJson = async <T>(url: string, token?: string): Promise<T> => {
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${url}`, {
    method: "DELETE",
    headers,
  });

  if (!res.ok) {
    const error = new Error("An error occurred while deleting the data.");
    (error as any).info = await res.json().catch(() => ({}));
    (error as any).status = res.status;
    throw error;
  }

  return res.json();
};
