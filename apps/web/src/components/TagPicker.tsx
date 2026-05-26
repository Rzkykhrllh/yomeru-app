"use client";

import { useState, useRef, useEffect } from "react";
import { Tag } from "@/types";
import { PlusIcon, XMarkIcon, TagIcon } from "@heroicons/react/24/outline";

interface TagPickerProps {
  allTags: Tag[];
  selectedTagIds: string[];
  onToggleTag: (tagId: string) => void;
  onCreateTag: (name: string, color: string) => Promise<void>;
}

const PRESET_COLORS = [
  "#EF4444", "#F97316", "#EAB308", "#22C55E",
  "#14B8A6", "#3B82F6", "#8B5CF6", "#EC4899",
  "#6B7280",
];

export default function TagPicker({
  allTags,
  selectedTagIds,
  onToggleTag,
  onCreateTag,
}: TagPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(PRESET_COLORS[5]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handle = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsCreating(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [isOpen]);

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    await onCreateTag(name, newColor);
    setNewName("");
    setNewColor(PRESET_COLORS[5]);
    setIsCreating(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen((p) => !p)}
        className="flex items-center gap-1 px-2 py-1 text-xs text-muted hover:text-ink border border-line rounded-lg hover:bg-highlight transition-colors"
      >
        <TagIcon className="w-3.5 h-3.5" />
        Tags
      </button>

      {isOpen && (
        <div className="absolute left-0 top-7 z-50 w-56 bg-card border border-line rounded-xl shadow-lg overflow-hidden">
          {/* Existing tags */}
          <div className="p-2 max-h-40 overflow-y-auto">
            {allTags.length === 0 && !isCreating ? (
              <p className="text-xs text-muted px-2 py-1">No tags yet</p>
            ) : (
              allTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => onToggleTag(tag.id)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-highlight transition-colors"
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="flex-1 text-left text-sm text-ink truncate">{tag.name}</span>
                  {selectedTagIds.includes(tag.id) && (
                    <span className="text-xs text-accent font-bold">✓</span>
                  )}
                </button>
              ))
            )}
          </div>

          <div className="border-t border-line" />

          {/* Create tag */}
          {isCreating ? (
            <div className="p-2 space-y-2">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Tag name"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                  if (e.key === "Escape") setIsCreating(false);
                }}
                className="w-full text-sm px-2 py-1 border border-line rounded-lg bg-surface text-ink focus:outline-none focus:border-accent"
              />
              <div className="flex flex-wrap gap-1">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewColor(c)}
                    className={`w-5 h-5 rounded-full border-2 transition-all ${
                      newColor === c ? "border-ink scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={handleCreate}
                  className="flex-1 text-xs px-2 py-1 bg-accent text-white rounded-lg hover:opacity-90"
                >
                  Create
                </button>
                <button
                  onClick={() => setIsCreating(false)}
                  className="px-2 py-1 text-xs text-muted hover:text-ink border border-line rounded-lg"
                >
                  <XMarkIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted hover:text-ink hover:bg-highlight transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              New tag
            </button>
          )}
        </div>
      )}
    </div>
  );
}
