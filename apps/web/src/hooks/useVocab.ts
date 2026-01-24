import useSWR from "swr";
import { VocabDetailResponse } from "@/types";

export function useVocab(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<VocabDetailResponse>(
    id ? `/api/vocabs/${id}` : null
  );

  return {
    vocab: data,
    isLoading,
    isError: error,
    mutate,
  };
}
