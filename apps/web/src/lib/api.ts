const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Fetcher for SWR
export const fetcher = async <T>(url: string): Promise<T> => {
  const res = await fetch(`${API_URL}${url}`);

  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.");

    // Attach extra info to the error object.
    (error as any).info = await res.json().catch(() => ({}));
    (error as any).status = res.status;
    throw error;
  }

  return res.json();
};

export const postJson = async <T>(url: string, data: any): Promise<T> => {
  const res = await fetch(`${API_URL}${url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = new Error("An error occurred while posting the data.");

    // Attach extra info to the error object.
    (error as any).info = await res.json().catch(() => ({}));
    (error as any).status = res.status;
    throw error;
  }

  return res.json();
};
