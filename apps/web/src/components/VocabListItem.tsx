"use client";

import { useState, useRef, useEffect } from "react";
import { Vocab, Tag } from "@/types";
import { TrashIcon } from "@heroicons/react/24/outline";
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
  const tagPickerRef = useRef<HTMLDivElement>(null);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete "${vocab.word}"?`)) onDelete();
  };

  const currentTagIds = vocab.vocabTags?.map((vt) => vt.tag.id) ?? [];

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        group relative px-3 py-2.5 cursor-pointer transition-colors
        rounded-xl border border-line bg-card
        hover:bg-highlight hover:shadow-card-hover
        ${isSelected ? "bg-accent-soft border-highlight-strong" : ""}
      `}
    >
      <div className="flex items-center justify-between gap-2 min-w-0">
        {/* Left: word + furigana + meaning */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="text-base font-semibold text-ink truncate">{vocab.word}</span>
            {vocab.furigana && (
              <span className="text-xs text-muted shrink-0">{vocab.furigana}</span>
            )}
          </div>
          {vocab.meaning && (
            <p className="text-xs text-muted truncate mt-0.5">{vocab.meaning}</p>
          )}
        </div>

        {/* Right: tag dots + actions on hover */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Tag color dots — always visible */}
          {vocab.vocabTags && vocab.vocabTags.length > 0 && (
            <div className="flex items-center gap-0.5">
              {vocab.vocabTags.slice(0, 3).map(({ tag }) => (
                <span
                  key={tag.id}
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: tag.color }}
                  title={tag.name}
                />
              ))}
              {vocab.vocabTags.length > 3 && (
                <span className="text-xs text-muted">+{vocab.vocabTags.length - 3}</span>
              )}
            </div>
          )}

          {/* Actions on hover */}
          {isHovered && (
            <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
              {onToggleTag && (
                <div ref={tagPickerRef}>
                  <TagPicker
                    allTags={allTags}
                    selectedTagIds={currentTagIds}
                    onToggleTag={(tagId) => onToggleTag(vocab.id, tagId)}
                    onCreateTag={onCreateTag ?? (async () => {})}
                  />
                </div>
              )}
              <button
                onClick={handleDelete}
                className="p-1 text-muted hover:text-danger transition-colors"
                title="Delete vocab"
              >
                <TrashIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
