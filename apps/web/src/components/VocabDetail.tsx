"use client";

import { useVocab, useUpdateVocab } from "@/hooks";
import { PencilIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useEffect, useState } from "react";

interface VocabDetailProps {
  vocabId: string;
}

export default function VocabDetail({ vocabId }: VocabDetailProps) {
  const { vocab, isLoading, isError } = useVocab(vocabId);
  const { updateVocab } = useUpdateVocab();

  const [isEditing, setIsEditing] = useState(false);
  const [word, setWord] = useState("");
  const [furigana, setFurigana] = useState("");
  const [meaning, setMeaning] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!vocab) return;
    setWord(vocab.word || "");
    setFurigana(vocab.furigana || "");
    setMeaning(vocab.meaning || "");
    setNotes(vocab.notes || "");
    setIsEditing(false);
  }, [vocabId, vocab]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (isError || !vocab) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-red-600">Failed to load vocabulary</div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!word.trim() || !furigana.trim() || !meaning.trim()) {
      alert("Word, furigana, and meaning are required");
      return;
    }

    setIsSaving(true);
    try {
      await updateVocab(vocabId, {
        word: word.trim(),
        furigana: furigana.trim(),
        meaning: meaning.trim(),
        notes: notes.trim() || undefined,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating vocab:", error);
      alert("Failed to update vocabulary. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (!vocab) return;
    setWord(vocab.word || "");
    setFurigana(vocab.furigana || "");
    setMeaning(vocab.meaning || "");
    setNotes(vocab.notes || "");
    setIsEditing(false);
  };

  return (
    <div className="h-full overflow-y-auto px-6 py-4">
      {/* Vocab Info */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  placeholder="Word"
                  className="w-full text-3xl font-bold border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="text"
                  value={furigana}
                  onChange={(e) => setFurigana(e.target.value)}
                  placeholder="Furigana"
                  className="w-full text-lg border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            ) : (
              <div className="flex items-baseline gap-3">
                <h1 className="text-4xl font-bold text-gray-900">{vocab.word}</h1>
                {vocab.furigana && (
                  <span className="text-xl text-gray-600">{vocab.furigana}</span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !word.trim() || !furigana.trim() || !meaning.trim()}
                  className="px-3 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Edit vocab"
                aria-label="Edit vocab"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meaning</label>
              <input
                type="text"
                value={meaning}
                onChange={(e) => setMeaning(e.target.value)}
                placeholder="Meaning"
                className="w-full text-lg border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes"
                rows={3}
                className="w-full text-base border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        ) : (
          <>
            {vocab.meaning && (
              <div className="mb-3">
                <span className="text-sm font-medium text-gray-700">Meaning: </span>
                <span className="text-lg text-gray-800">{vocab.meaning}</span>
              </div>
            )}

            {vocab.notes && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-sm font-medium text-gray-700 block mb-1">Notes:</span>
                <p className="text-gray-700">{vocab.notes}</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Appearances */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Appearances {vocab.appearances && `(${vocab.appearances.length})`}
        </h2>

        {vocab.appearances && vocab.appearances.length > 0 ? (
          <div className="space-y-3">
            {vocab.appearances.map((appearance, index) => (
              <Link
                key={index}
                href={`/texts?id=${appearance.textId}`}
                className="block p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-300 transition-all"
              >
                {/* Text Title + Source */}
                <div className="flex items-baseline gap-2 mb-2">
                  <h3 className="font-medium text-gray-900">
                    {appearance.textTitle || "Untitled"}
                  </h3>
                  {appearance.textSource && (
                    <span className="text-sm text-gray-500">• {appearance.textSource}</span>
                  )}
                </div>

                {/* Sentence */}
                <p className="text-gray-700 leading-relaxed">
                  "{appearance.sentence}"
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600">No appearances in saved texts yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Save this vocab from a text to see it here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
