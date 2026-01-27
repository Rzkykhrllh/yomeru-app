"use client";

import { useVocabs, useDeleteVocab } from "@/hooks";
import VocabListItem from "@/components/VocabListItem";
import VocabDetail from "@/components/VocabDetail";
import { useRouter, useSearchParams } from "next/navigation";

export default function VocabsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("id");

  const { vocabs, isLoading: vocabsLoading, isError: vocabsError } = useVocabs();
  const { deleteVocab } = useDeleteVocab();

  // Delete vocab
  const handleDelete = async (id: string) => {
    try {
      await deleteVocab(id);
      // If deleted vocab was selected, clear selection
      if (id === selectedId) {
        router.push("/vocabs");
      }
    } catch (error) {
      console.error("Error deleting vocab:", error);
      alert("Failed to delete vocabulary. Please try again.");
    }
  };

  return (
    <div className="flex h-screen">
      {/* Vocab List Sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col bg-white">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Vocabs</h2>
          <p className="text-sm text-gray-500 mt-1">
            {vocabs?.length || 0} {vocabs?.length === 1 ? "word" : "words"}
          </p>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {vocabsLoading && (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          )}

          {vocabsError && (
            <div className="p-4 text-center text-red-600">Failed to load vocabs</div>
          )}

          {vocabs && vocabs.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              <p className="mb-2">No vocabulary saved yet</p>
              <p className="text-xs">
                Go to Texts and click on words to save them
              </p>
            </div>
          )}

          {vocabs?.map((vocab) => (
            <VocabListItem
              key={vocab.id}
              vocab={vocab}
              isSelected={vocab.id === selectedId}
              onClick={() => router.push(`/vocabs?id=${vocab.id}`)}
              onDelete={() => handleDelete(vocab.id)}
            />
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-gray-50">
        {selectedId ? (
          <VocabDetail vocabId={selectedId} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="text-lg">Select a vocabulary to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
