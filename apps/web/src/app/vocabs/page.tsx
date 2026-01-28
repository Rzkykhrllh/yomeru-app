"use client";

import { useVocabs, useDeleteVocab } from "@/hooks";
import VocabListItem from "@/components/VocabListItem";
import VocabDetail from "@/components/VocabDetail";
import EmptyState from "@/components/EmptyState";
import ListSkeleton from "@/components/ListSkeleton";
import { BookOpenIcon } from "@heroicons/react/24/outline";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";

export default function VocabsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("id");
  const { showToast } = useToast();

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
      showToast("Vocabulary deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting vocab:", error);
      showToast("Failed to delete vocabulary. Please try again.", "error");
    }
  };

  return (
    <div className="flex h-screen">
      {/* Vocab List Sidebar */}
      <div className="w-80 border-r border-line bg-panel flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-line bg-panel">
          <h2 className="text-lg font-semibold text-gray-900">Vocabs</h2>
          <p className="text-sm muted mt-1">
            {vocabs?.length || 0} {vocabs?.length === 1 ? "word" : "words"}
          </p>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {vocabsLoading ? (
            <ListSkeleton count={5} />
          ) : vocabsError ? (
            <div className="p-4 text-center text-red-600">Failed to load vocabs</div>
          ) : vocabs && vocabs.length === 0 ? (
            <EmptyState
              icon={BookOpenIcon}
              title="No vocabulary yet"
              description="Go to Texts and click on Japanese words to save them to your vocabulary list"
            />
          ) : (
            vocabs?.map((vocab) => (
              <VocabListItem
                key={vocab.id}
                vocab={vocab}
                isSelected={vocab.id === selectedId}
                onClick={() => router.push(`/vocabs?id=${vocab.id}`)}
                onDelete={() => handleDelete(vocab.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className={`flex-1 bg-surface ${!selectedId ? 'flex items-center justify-center' : ''}`}>
        {selectedId ? (
          <VocabDetail vocabId={selectedId} />
        ) : (
          <EmptyState
            icon={BookOpenIcon}
            title="No vocabulary selected"
            description="Select a word from the sidebar to view its details and example sentences"
          />
        )}
      </div>
    </div>
  );
}
