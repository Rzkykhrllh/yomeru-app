import { mutate } from "swr";
import { deleteJson } from "@/lib/api";

export function useDeleteVocab() {
  const deleteVocab = async (id: string) => {
    await deleteJson<{ message: string }>(`/api/vocabs/${id}`);

    // Invalidate and refetch
    await mutate("/api/vocabs");
  };
  return { deleteVocab };
}
