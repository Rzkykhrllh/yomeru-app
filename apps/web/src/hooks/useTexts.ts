import useSWR from "swr";
import { Text } from "@/types";

interface TextsResponse {
  texts: Text[];
}

export function useTexts() {
  const { data, error, isLoading, mutate } = useSWR<TextsResponse>("/api/texts");
  return {
    texts: data?.texts ?? [],
    isLoading,
    isError: error,
    mutate,
  };
}
