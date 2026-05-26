"use client";

import { useState, useRef, useEffect } from "react";
import { Vocab, Tag } from "@/types";
import { TrashIcon, TagIcon } from "@heroicons/react/24/outline";
import TagPicker from "@/components/TagPicker";

interface VocabListItemProps {
  vocab: Vocab;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
  allTags?: Tag[];
  onToggleTag?: (vocabId: string, tagId: string) => void;
  onCreateTag?: (name: string, color: string) => Promise<void>;
}

export default function VocabListItem({
  vocab,
  isSelected,
  onClick,
  onDelete,
  allTags = [],
  onToggleTag,
  onCreateTag,
}: VocabListItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const tagPickerRef = useRef<HTMLDivElement>(null);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete "${vocab.word}"?`)) {
      onDelete();
    }
  };

  const currentTagIds = vocab.vocabTags?.map((vt) => vt.tag.id) ?? [];

  // Close tag picker when clicking outside
  useEffect(() => {
    if (!showTagPicker) return;
    const handle = (e: MouseEvent) => {
      if (tagPickerRef.current && !tagPickerRef.current.contains(e.target as Node)) {
        setShowTagPicker(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [showTagPicker]);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
      className={`
        group relative pl-5 pr-12 py-4 cursor-pointer transition-colors
        rounded-2xl border border-line bg-card shadow-card
        hover:bg-highlight hover:shadow-card-hover
        ${isSelected ? "bg-accent-soft border-highlight-strong shadow-card-hover" : ""}
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <h3 className="text-xl font-medium text-ink">{vocab.word}</h3>
            {vocab.furigana && <span className="text-sm text-muted">{vocab.furigana}</span>}
          </div>
          {vocab.meaning && <p className="text-sm text-muted truncate">{vocab.meaning}</p>}

          {/* Tag badges */}
          {vocab.vocabTags && vocab.vocabTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {vocab.vocabTags.map(({ tag }) => (
                <span
                  key={tag.id}
                  className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Hover actions */}
      {isHovered && (
        <div className="absolute top-3 right-3 flex items-center gap-1">
          {/* Tag picker button */}
          {onToggleTag && (
            <div ref={tagPickerRef} onClick={(e) => e.stopPropagation()}>
              <TagPicker
                allTags={allTags}
                selectedTagIds={currentTagIds}
                onToggleTag={(tagId) => onToggleTag(vocab.id, tagId)}
                onCreateTag={onCreateTag ?? (async () => {})}
              />
            </div>
          )}

          {/* Delete */}
          <button
            onClick={handleDelete}
            className="p-1 text-muted hover:text-ink transition-colors"
            title="Delete vocab"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
