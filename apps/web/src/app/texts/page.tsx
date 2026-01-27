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
import { PlusIcon } from "@heroicons/react/24/outline";
import { useRouter, useSearchParams } from "next/navigation";

export default function TextsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedTextId = searchParams.get("id");

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
      alert("Failed to create new text. Please try again.");
    }
  };

  // Update text / auto-save
  const handleUpdate = async (data: { title: string; content: string; source: string }) => {
    if (!selectedTextId) return;

    try {
      await updateText(selectedTextId, data);
    } catch (error) {
      console.error("Error updating text:", error);
      alert("Failed to update text. Please try again.");
    }
  };

  // Delete Text
  const handleDelete = async (id: string) => {
    try {
      await deleteText(id);
      if (id === selectedTextId) router.push("/texts");
    } catch (error) {
      console.error("Error deleting text:", error);
      alert("Failed to delete text. Please try again.");
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
    } catch (error) {
      console.error("Error saving vocab:", error);
      alert("Failed to save vocab. Please try again.");
    }
  };

  return (
    <div className="flex h-screen">
      {/* Text List Sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col bg-white">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Texts</h2>
          <button
            onClick={handleNewText}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="New text"
          >
            <PlusIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {textsLoading && (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          )}
          {textsError && (
            <div className="p-4 text-center text-red-600">Failed to load texts</div>
          )}
          {texts && texts.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              No texts yet. Create your first one!
            </div>
          )}
          {texts?.map((text) => (
            <TextListItem
              key={text.id}
              text={text}
              isSelected={text.id === selectedTextId}
              onClick={() => router.push(`/texts?id=${text.id}`)}
              onDelete={() => handleDelete(text.id)}
            />
          ))}
        </div>
      </div>
      {/* Content Area */}
      <div className="flex-1 bg-gray-50">
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
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="text-lg">Select your text or create a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}