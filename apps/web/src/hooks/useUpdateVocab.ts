import { useAuth } from "@clerk/nextjs";
import { mutate } from "swr";
import { putJson } from "@/lib/api";
import { Vocab } from "@/types";

interface UpdateVocabData {
  word: string;
  furigana: string;
  meaning: string;
  notes?: string;
}

export function useUpdateVocab() {
  const { getToken } = useAuth();

  const updateVocab = async (id: string, data: UpdateVocabData) => {
    const token = await getToken();
    const result = await putJson<{ vocab: Vocab }>(`/api/vocabs/${id}`, data, token ?? undefined);

    mutate("/api/vocabs");
    mutate(`/api/vocabs/${id}`);

    return result.vocab;
  };

  return { updateVocab };
}
