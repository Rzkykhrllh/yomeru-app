import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { postJson } from "@/lib/api";
import { Vocab } from "@/types";
import { mutate } from "swr";

interface CreateVocabData {
  word: string;
  furigana: string;
  meaning: string;
  notes?: string;
}

export function useCreateVocab() {
  const { getToken } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createVocab = async (data: CreateVocabData) => {
    setIsCreating(true);
    setError(null);

    try {
      const token = await getToken();
      const result = await postJson<{ vocab: Vocab }>("/api/vocabs", data, token ?? undefined);

      // Invalidate vocabs list to refetch
      await mutate("/api/vocabs");

      return result.vocab;
    } catch (err) {
      setError("Failed to create vocabulary");
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  return { createVocab, isCreating, error };
}
