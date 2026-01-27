"use client";

import { useVocab, useUpdateVocab } from "@/hooks";
import { PencilIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useToast } from "@/contexts/ToastContext";

interface VocabDetailProps {
  vocabId: string;
}

export default function VocabDetail({ vocabId }: VocabDetailProps) {
  const { vocab, isLoading, isError } = useVocab(vocabId);
  const { updateVocab } = useUpdateVocab();
  const { showToast } = useToast();

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
      showToast("Word, furigana, and meaning are required", "error");
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
      showToast("Vocabulary updated successfully", "success");
    } catch (error) {
      console.error("Error updating vocab:", error);
      showToast("Failed to update vocabulary. Please try again.", "error");
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
        <div className="rounded-2xl border border-line bg-card shadow-card p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-2">
                      Word
                    </label>
                    <input
                      type="text"
                      value={word}
                      onChange={(e) => setWord(e.target.value)}
                      placeholder="Word"
                      className="w-full text-3xl font-semibold px-3 py-2 rounded-xl border border-line bg-card focus:outline-none focus:ring-2 focus:ring-ring"
                      required
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-2">
                          Furigana
                        </label>
                      <input
                        type="text"
                        value={furigana}
                        onChange={(e) => setFurigana(e.target.value)}
                        placeholder="Furigana"
                        className="w-full text-lg px-3 py-2 rounded-xl border border-line bg-card focus:outline-none focus:ring-2 focus:ring-ring"
                        required
                      />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-2">
                          Meaning
                        </label>
                      <input
                        type="text"
                        value={meaning}
                        onChange={(e) => setMeaning(e.target.value)}
                        placeholder="Meaning"
                        className="w-full text-lg px-3 py-2 rounded-xl border border-line bg-card focus:outline-none focus:ring-2 focus:ring-ring"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-2">
                      Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Notes"
                      rows={3}
                      className="w-full text-base px-3 py-2 rounded-xl border border-line bg-card focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-end gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">
                        Word
                      </p>
                      <h1 className="text-4xl font-semibold text-gray-900">{vocab.word}</h1>
                    </div>
                    {vocab.furigana && (
                      <span className="text-sm px-3 py-1 rounded-full bg-accent-soft text-muted border border-highlight-strong">
                        {vocab.furigana}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-line bg-card px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                        Furigana
                      </p>
                      <p className="text-lg text-gray-800 mt-1">{vocab.furigana}</p>
                    </div>
                    <div className="rounded-xl border border-line bg-card px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                        Meaning
                      </p>
                      <p className="text-lg text-gray-800 mt-1">{vocab.meaning}</p>
                    </div>
                  </div>

                  {vocab.notes && (
                    <div className="mt-4 rounded-xl border border-line bg-highlight px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                        Notes
                      </p>
                      <p className="text-gray-700 mt-1">{vocab.notes}</p>
                    </div>
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
                    className="px-3 py-2 text-sm border border-line rounded-xl hover:bg-highlight transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !word.trim() || !furigana.trim() || !meaning.trim()}
                    className="px-3 py-2 text-sm rounded-xl bg-accent text-white hover:bg-ink transition-colors disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-muted hover:text-ink hover:bg-highlight rounded-lg transition-colors"
                  title="Edit vocab"
                  aria-label="Edit vocab"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
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
                className="block p-4 rounded-2xl border border-line bg-card shadow-card hover:shadow-card-hover hover:border-highlight-strong transition-all"
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
          <div className="text-center py-12 bg-highlight rounded-xl border border-line">
            <p className="text-muted">No appearances in saved texts yet</p>
            <p className="text-sm text-muted mt-1">
              Save this vocab from a text to see it here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
