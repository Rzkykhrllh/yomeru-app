"use client";

import { useState } from "react";

interface SaveTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { title: string; source?: string }) => Promise<void>;
}

export default function SaveTextModal({ isOpen, onClose, onSave }: SaveTextModalProps) {
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        title,
        source: source || undefined,
      });

      // Reset form
      setTitle("");
      setSource("");
      onClose();
    } catch (error) {
      console.error("Failed to save text:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      setTitle("");
      setSource("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-panel rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Save Text</h2>
          <button
            onClick={handleClose}
            disabled={isSaving}
            className="text-gray-400 hover:text-gray-700 text-2xl leading-none disabled:opacity-50"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-line bg-card focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="My Japanese Reading"
              required
              disabled={isSaving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source (optional)
            </label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-line bg-card focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Textbook, Article, etc."
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
              disabled={isSaving || !title.trim()}
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
