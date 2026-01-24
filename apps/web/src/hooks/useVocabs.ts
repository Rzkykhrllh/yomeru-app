import useSWR from "swr";
import { Vocab } from "@/types";

interface VocabsResponse {
  vocabs: Vocab[];
}

export function useVocabs() {
  const { data, error, isLoading, mutate } = useSWR<VocabsResponse>("/api/vocabs");

  return {
    vocabs: data?.vocabs ?? [],
    isLoading,
    isError: error,
    mutate,
  };
}
