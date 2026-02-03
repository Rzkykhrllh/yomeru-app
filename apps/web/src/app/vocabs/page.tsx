"use client";

import { useState, useRef, useEffect, useMemo, Suspense } from "react";
import { useVocabs, useDeleteVocab } from "@/hooks";
import VocabListItem from "@/components/VocabListItem";
import VocabDetail from "@/components/VocabDetail";
import EmptyState from "@/components/EmptyState";
import ListSkeleton from "@/components/ListSkeleton";
import SearchInput from "@/components/SearchInput";
import { BookOpenIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";
import { normalizeJapanese } from "@/lib/normalizeJapanese";

function VocabsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("id");
  const { showToast } = useToast();

  const { vocabs, isLoading: vocabsLoading, isError: vocabsError } = useVocabs();
  const { deleteVocab } = useDeleteVocab();

  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter vocabs based on search query
  const filteredVocabs = useMemo(() => {
    if (!vocabs || !searchQuery.trim()) return vocabs;

    const query = normalizeJapanese(searchQuery);

    return vocabs.filter((vocab) => {
      return (
        normalizeJapanese(vocab.word).includes(query) ||
        normalizeJapanese(vocab.furigana || "").includes(query) ||
        normalizeJapanese(vocab.meaning || "").includes(query) ||
        normalizeJapanese(vocab.notes || "").includes(query)
      );
    });
  }, [vocabs, searchQuery]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+F or Ctrl+F to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === "f") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }

      // Esc to clear search
      if (e.key === "Escape" && searchQuery) {
        setSearchQuery("");
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchQuery]);

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
          <p className="text-sm text-muted mt-1">
            {searchQuery.trim() ? (
              <>
                Showing {filteredVocabs?.length || 0} of {vocabs?.length || 0} words
              </>
            ) : (
              <>
                {vocabs?.length || 0} {vocabs?.length === 1 ? "word" : "words"}
              </>
            )}
          </p>
        </div>

        {/* Search Input */}
        <div className="px-3 py-3 border-b border-line bg-panel">
          <SearchInput
            ref={searchInputRef}
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search vocabs..."
            onClear={() => searchInputRef.current?.blur()}
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {vocabsLoading ? (
            <ListSkeleton count={5} />
          ) : vocabsError ? (
            <div className="p-4 text-center text-red-600">Failed to load vocabs</div>
          ) : filteredVocabs && filteredVocabs.length === 0 ? (
            searchQuery.trim() ? (
              <EmptyState
                icon={MagnifyingGlassIcon}
                title="No results found"
                description={`No vocabulary found matching "${searchQuery}"`}
                action={{
                  label: "Clear search",
                  onClick: () => setSearchQuery(""),
                }}
              />
            ) : (
              <EmptyState
                icon={BookOpenIcon}
                title="No vocabulary yet"
                description="Go to Texts and click on Japanese words to save them to your vocabulary list"
              />
            )
          ) : (
            filteredVocabs?.map((vocab) => (
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
      <div className={`flex-1 bg-surface ${!selectedId ? "flex items-center justify-center" : ""}`}>
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

export default function VocabsPage() {
  return (
    <Suspense fallback={<ListSkeleton count={5} />}>
      <VocabsPageContent />
    </Suspense>
  );
}
