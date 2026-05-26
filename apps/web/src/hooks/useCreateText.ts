import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { postJson } from "@/lib/api";
import { Text } from "@/types";
import { mutate } from "swr";

interface CreateTextData {
  title: string;
  content: string;
  source?: string;
  folderId?: string | null;
}

export function useCreateText() {
  const { getToken } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createText = async (data: CreateTextData) => {
    setIsCreating(true);
    setError(null);

    try {
      const token = await getToken();
      const result = await postJson<{ text: Text }>("/api/texts", data, token ?? undefined);

      // Invalidate texts list to refetch
      await mutate("/api/texts");

      return result.text;
    } catch (err) {
      setError("Failed to save text");
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  return { createText, isCreating, error };
}
