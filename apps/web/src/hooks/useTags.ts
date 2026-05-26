import useSWR from "swr";
import { Tag } from "@/types";

interface TagsResponse {
  tags: Tag[];
}

export function useTags() {
  const { data, error, isLoading, mutate } = useSWR<TagsResponse>("/api/tags");

  return {
    tags: data?.tags ?? [],
    isLoading,
    isError: error,
    mutate,
  };
}
