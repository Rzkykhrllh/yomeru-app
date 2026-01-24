import useSWR from "swr";
import { TextDetailResponse } from "@/types";

export function useText(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<TextDetailResponse>(
    id ? `/api/texts/${id}` : null
  );

  return {
    text: data,
    isLoading,
    isError: error,
    mutate,
  };
}
