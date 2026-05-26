import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { postJson, putJson, deleteJson } from "@/lib/api";
import { Folder } from "@/types";
import { mutate } from "swr";

export function useCreateFolder() {
  const { getToken } = useAuth();
  const [isCreating, setIsCreating] = useState(false);

  const createFolder = async (name: string) => {
    setIsCreating(true);
    try {
      const token = await getToken();
      const result = await postJson<{ folder: Folder }>("/api/folders", { name }, token ?? undefined);
      await mutate("/api/folders");
      return result.folder;
    } finally {
      setIsCreating(false);
    }
  };

  return { createFolder, isCreating };
}

export function useUpdateFolder() {
  const { getToken } = useAuth();

  const updateFolder = async (id: string, name: string) => {
    const token = await getToken();
    const result = await putJson<{ folder: Folder }>(`/api/folders/${id}`, { name }, token ?? undefined);
    await mutate("/api/folders");
    return result.folder;
  };

  return { updateFolder };
}

export function useDeleteFolder() {
  const { getToken } = useAuth();

  const deleteFolder = async (id: string) => {
    const token = await getToken();
    await deleteJson<{ message: string }>(`/api/folders/${id}`, token ?? undefined);
    await mutate("/api/folders");
    await mutate("/api/texts");
  };

  return { deleteFolder };
}
