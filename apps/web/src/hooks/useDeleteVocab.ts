import { useAuth } from "@clerk/nextjs";
import { mutate } from "swr";
import { deleteJson } from "@/lib/api";

export function useDeleteVocab() {
  const { getToken } = useAuth();

  const deleteVocab = async (id: string) => {
    const token = await getToken();
    await deleteJson<{ message: string }>(`/api/vocabs/${id}`, token ?? undefined);

    // Invalidate and refetch
    await mutate("/api/vocabs");
  };
  return { deleteVocab };
}
