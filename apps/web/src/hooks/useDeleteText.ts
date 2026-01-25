import { mutate } from "swr";
import { deleteJson } from "@/lib/api";

export function useDeleteText() {
  const deleteText = async (id: string) => {
    await deleteJson<{ message: string }>(`/api/texts/${id}`);

    // Invalidate the SWR cache for texts
    await mutate("/api/texts");
  };

  return { deleteText };
}
