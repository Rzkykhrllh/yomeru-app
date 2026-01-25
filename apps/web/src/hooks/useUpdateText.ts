import { mutate } from "swr";
import { putJson } from "@/lib/api";
import { Text } from "@/types";

export function useUpdateText() {
  const updateText = async (
    id: string,
    data: { title?: string; content?: string; source?: string }
  ) => {
    const result = await putJson<{ text: Text }>(`/api/texts/${id}`, data);

    // Invalidate the SWR cache for texts
    await mutate("/api/texts");
    await mutate(`/api/texts/${id}`);

    return result.text;
  };

  return { updateText };
}
