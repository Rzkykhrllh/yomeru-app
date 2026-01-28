"use client";

import {
  useTexts,
  useVocabs,
  useCreateText,
  useUpdateText,
  useDeleteText,
  useCreateVocab,
  useCreateTextVocab,
} from "@/hooks";
import TextListItem from "@/components/TextListItem";
import TextEditor from "@/components/TextEditor";
import EmptyState from "@/components/EmptyState";
import ListSkeleton from "@/components/ListSkeleton";
import { PlusIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";

export default function TextsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedTextId = searchParams.get("id");
  const { showToast } = useToast();

  const { texts, isLoading: textsLoading, isError: textsError } = useTexts();
  const { vocabs } = useVocabs();
  const { createText } = useCreateText();
  const { updateText } = useUpdateText();
  const { deleteText } = useDeleteText();
  const { createVocab } = useCreateVocab();
  const { createTextVocab } = useCreateTextVocab();

  const selectedText = texts?.find((text) => text.id === selectedTextId) || null;

  const handleNewText = async () => {
    try {
      const newText = await createText({
        title: "",
        content: "",
        source: new Date().toLocaleDateString(),
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
      // First, create the vocab
      const vocab = await createVocab({
        word: data.word,
        furigana: data.furigana,
        meaning: data.meaning,
        notes: data.notes,
      });

      // Then, create the text-vocab link with sentence
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
      throw error; // Re-throw to let VocabModal handle the error toast
    }
  };

  return (
    <div className="flex h-screen">
      {/* Text List Sidebar */}
      <div className="w-80 border-r border-line bg-panel flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-line bg-panel flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Texts</h2>
          <button
            onClick={handleNewText}
            className="p-2 text-muted hover:text-ink hover:bg-highlight transition-colors rounded-lg"
            title="New text"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>
        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {textsLoading ? (
            <ListSkeleton count={5} />
          ) : textsError ? (
            <div className="p-4 text-center text-red-600">Failed to load texts</div>
          ) : texts && texts.length === 0 ? (
            <EmptyState
              icon={DocumentTextIcon}
              title="No texts yet"
              description="Start by creating your first Japanese text to begin learning vocabulary"
              action={{
                label: "Create text",
                onClick: handleNewText,
              }}
            />
          ) : (
            texts?.map((text) => (
              <TextListItem
                key={text.id}
                text={text}
                isSelected={text.id === selectedTextId}
                onClick={() => router.push(`/texts?id=${text.id}`)}
                onDelete={() => handleDelete(text.id)}
              />
            ))
          )}
        </div>
      </div>
      {/* Content Area */}
      <div className={`flex-1 bg-surface ${!selectedText ? 'flex items-center justify-center' : ''}`}>
        {selectedText ? (
          <TextEditor
            key={selectedText.id} // Force re-mount on text change
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
