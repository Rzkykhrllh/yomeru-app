import useSWR from "swr";
import { Folder } from "@/types";

interface FoldersResponse {
  folders: Folder[];
}

export function useFolders() {
  const { data, error, isLoading, mutate } = useSWR<FoldersResponse>("/api/folders");

  return {
    folders: data?.folders ?? [],
    isLoading,
    isError: error,
    mutate,
  };
}
