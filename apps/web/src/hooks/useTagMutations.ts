import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { postJson, putJson, deleteJson } from "@/lib/api";
import { Tag } from "@/types";
import { mutate } from "swr";

export function useCreateTag() {
  const { getToken } = useAuth();
  const [isCreating, setIsCreating] = useState(false);

  const createTag = async (name: string, color?: string) => {
    setIsCreating(true);
    try {
      const token = await getToken();
      const result = await postJson<{ tag: Tag }>("/api/tags", { name, color }, token ?? undefined);
      await mutate("/api/tags");
      return result.tag;
    } finally {
      setIsCreating(false);
    }
  };

  return { createTag, isCreating };
}

export function useUpdateTag() {
  const { getToken } = useAuth();

  const updateTag = async (id: string, name: string, color?: string) => {
    const token = await getToken();
    const result = await putJson<{ tag: Tag }>(`/api/tags/${id}`, { name, color }, token ?? undefined);
    await mutate("/api/tags");
    return result.tag;
  };

  return { updateTag };
}

export function useDeleteTag() {
  const { getToken } = useAuth();

  const deleteTag = async (id: string) => {
    const token = await getToken();
    await deleteJson<{ message: string }>(`/api/tags/${id}`, token ?? undefined);
    await mutate("/api/tags");
    await mutate("/api/vocabs");
  };

  return { deleteTag };
}

export function useSetVocabTags() {
  const { getToken } = useAuth();

  const setVocabTags = async (vocabId: string, tagIds: string[]) => {
    const token = await getToken();
    const result = await putJson<{ vocab: any }>(`/api/tags/vocab/${vocabId}`, { tagIds }, token ?? undefined);
    await mutate("/api/vocabs");
    return result.vocab;
  };

  return { setVocabTags };
}
