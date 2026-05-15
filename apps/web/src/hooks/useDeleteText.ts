import { useAuth } from "@clerk/nextjs";
import { mutate } from "swr";
import { deleteJson } from "@/lib/api";

export function useDeleteText() {
  const { getToken } = useAuth();

  const deleteText = async (id: string) => {
    const token = await getToken();
    await deleteJson<{ message: string }>(`/api/texts/${id}`, token ?? undefined);

    // Invalidate the SWR cache for texts
    await mutate("/api/texts");
  };

  return { deleteText };
}
