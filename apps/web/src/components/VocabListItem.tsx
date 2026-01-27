"use client";

import { useState } from "react";
import { Vocab } from "@/types";
import { TrashIcon } from "@heroicons/react/24/outline";

interface VocabListItemProps {
  vocab: Vocab;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
}

export default function VocabListItem({ vocab, isSelected, onClick, onDelete }: VocabListItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete "${vocab.word}"?`)) {
      onDelete();
    }
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
            <h3 className="text-xl font-medium text-gray-900">{vocab.word}</h3>
            {vocab.furigana && (
              <span className="text-sm text-muted">{vocab.furigana}</span>
            )}
          </div>
          {vocab.meaning && (
            <p className="text-sm text-muted truncate">{vocab.meaning}</p>
          )}
        </div>

        {/* Delete button - show on hover */}
        <button
          onClick={handleDelete}
          className={`absolute top-3 right-3 p-1 text-muted hover:text-ink transition-opacity ${
            isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          title="Delete vocab"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
