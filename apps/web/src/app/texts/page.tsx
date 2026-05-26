"use client";

import { useState, useRef, useEffect, useMemo, Suspense } from "react";
import {
  useTexts,
  useVocabs,
  useCreateText,
  useUpdateText,
  useDeleteText,
  useCreateVocab,
  useCreateTextVocab,
  useFolders,
  useCreateFolder,
  useUpdateFolder,
  useDeleteFolder,
} from "@/hooks";
import TextListItem from "@/components/TextListItem";
import TextEditor from "@/components/TextEditor";
import EmptyState from "@/components/EmptyState";
import ListSkeleton from "@/components/ListSkeleton";
import SearchInput from "@/components/SearchInput";
import FolderSidebar from "@/components/FolderSidebar";
import { PlusIcon, DocumentTextIcon, MagnifyingGlassIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from "@heroicons/react/24/outline";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";
import { normalizeJapanese } from "@/lib/normalizeJapanese";

function TextsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedTextId = searchParams.get("id");
  const { showToast } = useToast();

  const { texts, isLoading: textsLoading, isError: textsError } = useTexts();
  const { vocabs } = useVocabs();
  const { folders } = useFolders();
  const { createText } = useCreateText();
  const { updateText } = useUpdateText();
  const { deleteText } = useDeleteText();
  const { createVocab } = useCreateVocab();
  const { createTextVocab } = useCreateTextVocab();
  const { createFolder } = useCreateFolder();
  const { updateFolder } = useUpdateFolder();
  const { deleteFolder } = useDeleteFolder();

  const selectedText = texts?.find((text) => text.id === selectedTextId) || null;

  // Folder filter state
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [textListCollapsed, setTextListCollapsed] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter texts: first by folder, then by search query
  const filteredTexts = useMemo(() => {
    if (!texts) return texts;

    let result = texts;

    // Folder filter
    if (selectedFolderId !== null) {
      result = result.filter((t) => t.folderId === selectedFolderId);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = normalizeJapanese(searchQuery.trim());
      result = result.filter((text) => {
        return (
          normalizeJapanese(text.title || "").includes(query) ||
          normalizeJapanese(text.content).includes(query) ||
          normalizeJapanese(text.source || "").includes(query)
        );
      });
    }

    return result;
  }, [texts, searchQuery, selectedFolderId]);

  // keyboard shortcut: focus search input on cmd+f
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape" && searchQuery) {
        setSearchQuery("");
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [searchQuery]);

  const handleNewText = async () => {
    try {
      const newText = await createText({
        title: "",
        content: "",
        source: new Date().toLocaleDateString(),
        folderId: selectedFolderId ?? undefined,
      });
      router.push(`/texts?id=${newText.id}`);
    } catch (error) {
      console.error("Error creating new text:", error);
      showToast("Failed to create new text. Please try again.", "error");
    }
  };

  // Update text / auto-save
  const handleUpdate = async (data: { title: string; content: string; source: string }) => {
    if (!selectedTextId) return;

    try {
      await updateText(selectedTextId, data);
    } catch (error) {
      console.error("Error updating text:", error);
      showToast("Failed to update text. Please try again.", "error");
    }
  };

  // Move text to folder
  const handleMoveToFolder = async (textId: string, folderId: string | null) => {
    try {
      await updateText(textId, { folderId });
    } catch (error) {
      console.error("Error moving text to folder:", error);
      showToast("Failed to move text. Please try again.", "error");
    }
  };

  // Delete Text
  const handleDelete = async (id: string) => {
    try {
      await deleteText(id);
      if (id === selectedTextId) router.push("/texts");
      showToast("Text deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting text:", error);
      showToast("Failed to delete text. Please try again.", "error");
    }
  };

  const handleSaveVocab = async (data: {
    word: string;
    furigana: string;
    meaning: string;
    notes?: string;
    sentence: string;
  }) => {
    if (!selectedTextId) return;

    try {
      const vocab = await createVocab({
        word: data.word,
        furigana: data.furigana,
        meaning: data.meaning,
        notes: data.notes,
      });
      await createTextVocab({
        vocabId: vocab.id,
        textId: selectedTextId,
        sentence: data.sentence,
      });
      showToast("Vocabulary saved successfully", "success");
    } catch (error) {
      console.error("Error saving vocab:", error);
      showToast("Failed to save vocab. Please try again.", "error");
    }
  };

  const handleSaveSentence = async (vocabId: string, sentence: string) => {
    if (!selectedTextId) return;

    try {
      await createTextVocab({
        vocabId,
        textId: selectedTextId,
        sentence,
      });
    } catch (error) {
      console.error("Error saving sentence:", error);
      throw error;
    }
  };

  // Folder handlers
  const handleCreateFolder = async (name: string) => {
    try {
      await createFolder(name);
    } catch (error: any) {
      showToast(error?.info?.error || "Failed to create folder", "error");
    }
  };

  const handleRenameFolder = async (id: string, name: string) => {
    try {
      await updateFolder(id, name);
    } catch (error: any) {
      showToast(error?.info?.error || "Failed to rename folder", "error");
    }
  };

  const handleDeleteFolder = async (id: string) => {
    try {
      await deleteFolder(id);
    } catch (error) {
      showToast("Failed to delete folder", "error");
    }
  };

  return (
    <div className="flex h-screen">
      {/* Folder Sidebar */}
      <FolderSidebar
        folders={folders}
        selectedFolderId={selectedFolderId}
        onSelectFolder={setSelectedFolderId}
        onCreateFolder={handleCreateFolder}
        onRenameFolder={handleRenameFolder}
        onDeleteFolder={handleDeleteFolder}
        onDropText={handleMoveToFolder}
      />

      {/* Text List Sidebar */}
      {textListCollapsed ? (
        <div className="w-10 border-r border-line bg-panel flex flex-col shrink-0 items-center py-2 gap-2">
          <button
            onClick={() => setTextListCollapsed(false)}
            className="p-1.5 text-muted hover:text-ink rounded transition-colors"
            title="Expand text list"
          >
            <ChevronDoubleRightIcon className="w-4 h-4" />
          </button>
          <div className="w-full border-t border-line" />
          {/* Count badge */}
          <span className="text-xs font-bold text-muted bg-highlight rounded-full w-6 h-6 flex items-center justify-center">
            {filteredTexts?.length ?? 0}
          </span>
          {/* Rotated label */}
          <div className="flex-1 flex items-center justify-center">
            <span
              className="text-xs font-semibold text-muted uppercase tracking-widest select-none"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              {selectedFolderId
                ? (folders.find((f) => f.id === selectedFolderId)?.name ?? "Texts")
                : "All Texts"}
            </span>
          </div>
        </div>
      ) : (
        <div className="w-80 border-r border-line bg-panel flex flex-col">
          {/* Header */}
          <div className="px-5 py-4 border-b border-line bg-panel flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">
              {selectedFolderId
                ? (folders.find((f) => f.id === selectedFolderId)?.name ?? "Texts")
                : "All Texts"}
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={handleNewText}
                className="p-2 text-muted hover:text-ink hover:bg-highlight transition-colors rounded-lg"
                title="New text"
              >
                <PlusIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setTextListCollapsed(true)}
                className="p-2 text-muted hover:text-ink hover:bg-highlight transition-colors rounded-lg"
                title="Collapse list"
              >
                <ChevronDoubleLeftIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="px-3 py-3 border-b border-line bg-panel">
            <SearchInput
              ref={searchInputRef}
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search texts..."
              onClear={() => searchInputRef.current?.blur()}
            />
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {textsLoading ? (
              <ListSkeleton count={5} />
            ) : textsError ? (
              <div className="p-4 text-center text-danger">Failed to load texts</div>
            ) : filteredTexts && filteredTexts.length === 0 ? (
              searchQuery.trim() ? (
                <EmptyState
                  icon={MagnifyingGlassIcon}
                  title="No results found"
                  description={`No texts found matching "${searchQuery}"`}
                  action={{ label: "Clear search", onClick: () => setSearchQuery("") }}
                />
              ) : (
                <EmptyState
                  icon={DocumentTextIcon}
                  title="No texts yet"
                  description="Start by creating your first Japanese text to begin learning vocabulary"
                  action={{ label: "Create text", onClick: handleNewText }}
                />
              )
            ) : (
              filteredTexts?.map((text) => (
                <TextListItem
                  key={text.id}
                  text={text}
                  isSelected={text.id === selectedTextId}
                  onClick={() => router.push(`/texts?id=${text.id}`)}
                  onDelete={() => handleDelete(text.id)}
                  folders={folders}
                  onMoveToFolder={(folderId) => handleMoveToFolder(text.id, folderId)}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* Content Area */}
      <div
        className={`flex-1 bg-surface ${!selectedText ? "flex items-center justify-center" : ""}`}
      >
        {selectedText ? (
          <TextEditor
            key={selectedText.id}
            textId={selectedText.id}
            initialTitle={selectedText.title || ""}
            initialContent={selectedText.content}
            initialSource={selectedText.source || ""}
            vocabs={vocabs || []}
            onUpdate={handleUpdate}
            onSaveVocab={handleSaveVocab}
            onSaveSentence={handleSaveSentence}
          />
        ) : (
          <EmptyState
            icon={DocumentTextIcon}
            title="No text selected"
            description="Select a text from the sidebar or create a new one to get started"
          />
        )}
      </div>
    </div>
  );
}

export default function TextsPage() {
  return (
    <Suspense fallback={<ListSkeleton count={5} />}>
      <TextsPageContent />
    </Suspense>
  );
}
