import { mutate } from "swr";
import { postJson } from "@/lib/api";

interface CreateTextVocabData {
  vocabId: string;
  textId: string;
  sentence: string;
}

export function useCreateTextVocab() {
  const createTextVocab = async (data: CreateTextVocabData) => {
    const result = await postJson<{ textVocab: any }>("/api/text-vocabs", data);

    // Invalidate caches
    mutate("/api/texts");
    mutate(`/api/texts/${data.textId}`);
    mutate("/api/vocabs");
    mutate(`/api/vocabs/${data.vocabId}`);

    return result.textVocab;
  };

  return { createTextVocab };
}
