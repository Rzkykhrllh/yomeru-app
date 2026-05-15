"use client";

import { SWRConfig } from "swr";
import { useAuth } from "@clerk/nextjs";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export function Providers({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();

  const fetcher = async (url: string) => {
    const token = await getToken();
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

  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        shouldRetryOnError: false,
      }}
    >
      {children}
    </SWRConfig>
  );
}
