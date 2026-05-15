import { useAuth } from "@clerk/nextjs";
import { mutate } from "swr";
import { postJson } from "@/lib/api";

interface CreateTextVocabData {
  vocabId: string;
  textId: string;
  sentence: string;
}

export function useCreateTextVocab() {
  const { getToken } = useAuth();

  const createTextVocab = async (data: CreateTextVocabData) => {
    const token = await getToken();
    const result = await postJson<{ textVocab: any }>("/api/text-vocabs", data, token ?? undefined);

    // Invalidate caches
    mutate("/api/texts");
    mutate(`/api/texts/${data.textId}`);
    mutate("/api/vocabs");
    mutate(`/api/vocabs/${data.vocabId}`);

    return result.textVocab;
  };

  return { createTextVocab };
}
