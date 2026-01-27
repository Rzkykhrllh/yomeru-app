"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/contexts/ToastContext";

interface VocabModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: {
    surface_form: string;
    basic_form: string;
    reading: string;
    pos: string;
  } | null;
  sentence: string;
  onSave: (data: {
    word: string;
    furigana: string;
    meaning: string;
    notes?: string;
    sentence: string;
  }) => Promise<void>;
}

export default function VocabModal({ isOpen, onClose, token, sentence, onSave }: VocabModalProps) {
  const { showToast } = useToast();
  const [word, setWord] = useState("");
  const [furigana, setFurigana] = useState("");
  const [meaning, setMeaning] = useState("");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Auto-fill word and furigana when token changes
  useEffect(() => {
    if (token) {
      setWord(token.surface_form);
      setFurigana(token.reading || "");
      setMeaning("");
      setNotes(`Context: ${sentence}`);
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission

    if (!word.trim() || !furigana.trim() || !meaning.trim()) {
      showToast("Word, furigana, and meaning are required", "error");
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        word: word.trim(),
        furigana: furigana.trim(),
        meaning: meaning.trim(),
        notes: notes.trim() || undefined,
        sentence,
      });
      onClose();
    } catch (error) {
      console.error("Error saving vocab:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      onClose();
    }
  };

  if (!isOpen || !token) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-panel rounded-2xl shadow-xl max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Save Vocabulary</h2>
          <button
            onClick={handleClose}
            disabled={isSaving}
            className="text-gray-400 hover:text-gray-700 text-2xl leading-none disabled:opacity-50"
          >
            ×
          </button>
        </div>
        <div className="mb-4 p-4 bg-highlight rounded-xl border border-line">
          <p className="text-sm text-gray-600 mb-1">Context:</p>
          <p className="text-lg text-gray-900 leading-relaxed">{sentence}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Word <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-line bg-card text-xl focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="食べる"
              required
              disabled={isSaving}
            />
          </div>
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Furigana <span className="text-red-500">*</span>
              </label>
            <input
              type="text"
              value={furigana}
              onChange={(e) => setFurigana(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-line bg-card focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="たべる"
              required
              disabled={isSaving}
            />
          </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meaning <span className="text-red-500">*</span>
              </label>
            <input
              type="text"
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-line bg-card focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="to eat"
              required
              disabled={isSaving}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-line bg-card resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Personal notes..."
              rows={3}
              disabled={isSaving}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSaving}
              className="flex-1 px-4 py-2 border border-line rounded-xl hover:bg-highlight transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-4 py-2 rounded-xl bg-accent text-white hover:bg-ink transition-colors disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
