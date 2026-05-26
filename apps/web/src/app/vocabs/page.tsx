"use client";

import { useState, useRef, useEffect, useMemo, Suspense } from "react";
import { useVocabs, useDeleteVocab, useTags, useDeleteTag, useCreateTag, useSetVocabTags } from "@/hooks";
import VocabListItem from "@/components/VocabListItem";
import VocabDetail from "@/components/VocabDetail";
import EmptyState from "@/components/EmptyState";
import ListSkeleton from "@/components/ListSkeleton";
import SearchInput from "@/components/SearchInput";
import { BookOpenIcon, MagnifyingGlassIcon, TrashIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from "@heroicons/react/24/outline";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";
import { normalizeJapanese } from "@/lib/normalizeJapanese";

function VocabsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("id");
  const { showToast } = useToast();

  const { vocabs, isLoading: vocabsLoading, isError: vocabsError } = useVocabs();
  const { tags } = useTags();
  const { deleteVocab } = useDeleteVocab();
  const { deleteTag } = useDeleteTag();
  const { createTag } = useCreateTag();
  const { setVocabTags } = useSetVocabTags();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [tagSidebarCollapsed, setTagSidebarCollapsed] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter vocabs by tag then by search query
  const filteredVocabs = useMemo(() => {
    if (!vocabs) return vocabs;

    let result = vocabs;

    // Tag filter
    if (selectedTagId) {
      result = result.filter((v) =>
        v.vocabTags?.some((vt) => vt.tag.id === selectedTagId)
      );
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = normalizeJapanese(searchQuery);
      result = result.filter((vocab) => {
        return (
          normalizeJapanese(vocab.word).includes(query) ||
          normalizeJapanese(vocab.furigana || "").includes(query) ||
          normalizeJapanese(vocab.meaning || "").includes(query) ||
          normalizeJapanese(vocab.notes || "").includes(query)
        );
      });
    }

    return result;
  }, [vocabs, searchQuery, selectedTagId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "f") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape" && searchQuery) {
        setSearchQuery("");
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchQuery]);

  const handleDelete = async (id: string) => {
    try {
      await deleteVocab(id);
      if (id === selectedId) router.push("/vocabs");
      showToast("Vocabulary deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting vocab:", error);
      showToast("Failed to delete vocabulary. Please try again.", "error");
    }
  };

  const handleDeleteTag = async (id: string, name: string) => {
    if (!confirm(`Delete tag "${name}"? It will be removed from all vocabs.`)) return;
    try {
      await deleteTag(id);
      if (selectedTagId === id) setSelectedTagId(null);
    } catch {
      showToast("Failed to delete tag", "error");
    }
  };

  const handleToggleTag = async (vocabId: string, tagId: string) => {
    const vocab = vocabs?.find((v) => v.id === vocabId);
    const currentIds = vocab?.vocabTags?.map((vt) => vt.tag.id) ?? [];
    const newIds = currentIds.includes(tagId)
      ? currentIds.filter((id) => id !== tagId)
      : [...currentIds, tagId];
    try {
      await setVocabTags(vocabId, newIds);
    } catch {
      showToast("Failed to update tags", "error");
    }
  };

  const handleCreateTag = async (name: string, color: string) => {
    try {
      await createTag(name, color);
    } catch (error: any) {
      showToast(error?.info?.error || "Failed to create tag", "error");
    }
  };

  return (
    <div className="flex h-screen">
      {/* Tag Filter Sidebar */}
      {tagSidebarCollapsed ? (
        <div className="w-10 border-r border-line bg-panel flex flex-col shrink-0 items-center py-2 gap-1">
          <button
            onClick={() => setTagSidebarCollapsed(false)}
            className="p-1.5 text-muted hover:text-ink rounded transition-colors"
            title="Expand tags"
          >
            <ChevronDoubleRightIcon className="w-4 h-4" />
          </button>
          <div className="w-full border-t border-line my-1" />
          <button
            onClick={() => setSelectedTagId(null)}
            className={`p-1.5 rounded transition-colors ${
              selectedTagId === null ? "text-ink bg-accent-soft" : "text-muted hover:text-ink hover:bg-highlight"
            }`}
            title="All Vocabs"
          >
            <BookOpenIcon className="w-4 h-4" />
          </button>
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => setSelectedTagId(tag.id)}
              className={`p-1.5 rounded transition-colors ${
                selectedTagId === tag.id ? "bg-accent-soft" : "hover:bg-highlight"
              }`}
              title={tag.name}
            >
              <span
                className="block w-3 h-3 rounded-full"
                style={{ backgroundColor: tag.color }}
              />
            </button>
          ))}
        </div>
      ) : (
        <div className="w-48 border-r border-line bg-panel flex flex-col shrink-0">
          <div className="px-3 py-3 border-b border-line flex items-center justify-between">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">Tags</span>
            <button
              onClick={() => setTagSidebarCollapsed(true)}
              className="p-1 text-muted hover:text-ink rounded transition-colors"
              title="Collapse sidebar"
            >
              <ChevronDoubleLeftIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {/* All Vocabs */}
            <button
              onClick={() => setSelectedTagId(null)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                selectedTagId === null
                  ? "bg-accent-soft text-ink font-medium"
                  : "text-muted hover:text-ink hover:bg-highlight"
              }`}
            >
              <BookOpenIcon className="w-4 h-4 shrink-0" />
              <span className="truncate">All Vocabs</span>
            </button>

            {/* Tag list */}
            {tags.map((tag) => (
              <div key={tag.id} className="group relative flex items-center">
                <button
                  onClick={() => setSelectedTagId(tag.id)}
                  className={`flex-1 flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                    selectedTagId === tag.id
                      ? "bg-accent-soft text-ink font-medium"
                      : "text-muted hover:text-ink hover:bg-highlight"
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="flex-1 truncate text-left">{tag.name}</span>
                  {tag._count && (
                    <span className="text-xs text-muted">{tag._count.vocabTags}</span>
                  )}
                </button>
                <button
                  onClick={() => handleDeleteTag(tag.id, tag.name)}
                  className="absolute right-1 opacity-0 group-hover:opacity-100 p-1 text-muted hover:text-danger rounded transition-all"
                  title="Delete tag"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            {tags.length === 0 && (
              <p className="px-3 py-2 text-xs text-muted">
                No tags yet. Open a vocab to add tags.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Vocab List Sidebar */}
      <div className="w-80 border-r border-line bg-panel flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-line bg-panel">
          <h2 className="text-lg font-semibold text-ink">
            {selectedTagId ? (tags.find((t) => t.id === selectedTagId)?.name ?? "Vocabs") : "Vocabs"}
          </h2>
          <p className="text-sm text-muted mt-1">
            {searchQuery.trim() || selectedTagId ? (
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
            <div className="p-4 text-center text-danger">Failed to load vocabs</div>
          ) : filteredVocabs && filteredVocabs.length === 0 ? (
            searchQuery.trim() || selectedTagId ? (
              <EmptyState
                icon={MagnifyingGlassIcon}
                title="No results found"
                description={
                  searchQuery.trim()
                    ? `No vocabulary found matching "${searchQuery}"`
                    : "No vocabulary with this tag"
                }
                action={
                  searchQuery.trim()
                    ? { label: "Clear search", onClick: () => setSearchQuery("") }
                    : { label: "Show all", onClick: () => setSelectedTagId(null) }
                }
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
                allTags={tags}
                onToggleTag={handleToggleTag}
                onCreateTag={handleCreateTag}
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
