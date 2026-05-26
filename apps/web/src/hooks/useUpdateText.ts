import { useAuth } from "@clerk/nextjs";
import { mutate } from "swr";
import { putJson } from "@/lib/api";
import { Text } from "@/types";

export function useUpdateText() {
  const { getToken } = useAuth();

  const updateText = async (
    id: string,
    data: { title?: string; content?: string; source?: string; folderId?: string | null }
  ) => {
    const token = await getToken();
    const result = await putJson<{ text: Text }>(`/api/texts/${id}`, data, token ?? undefined);

    // Invalidate the SWR cache for texts
    await mutate("/api/texts");
    await mutate(`/api/texts/${id}`);

    return result.text;
  };

  return { updateText };
}
