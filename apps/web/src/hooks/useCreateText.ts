import { useState } from "react";
import { postJson } from "@/lib/api";
import { Text } from "@/types";
import { mutate } from "swr";

interface CreateTextData {
  title: string;
  content: string;
  source?: string;
}

export function useCreateText() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createText = async (data: CreateTextData) => {
    setIsCreating(true);
    setError(null);

    try {
      const result = await postJson<{ text: Text }>("/api/texts", data);

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
