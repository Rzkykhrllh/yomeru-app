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
        group relative px-4 py-3 cursor-pointer border-b border-gray-200
        hover:bg-gray-50 transition-colors
        ${isSelected ? "bg-blue-50 border-l-4 border-l-blue-500" : ""}
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <h3 className="text-xl font-medium text-gray-900">{vocab.word}</h3>
            {vocab.furigana && (
              <span className="text-sm text-gray-500">{vocab.furigana}</span>
            )}
          </div>
          {vocab.meaning && (
            <p className="text-sm text-gray-600 truncate">{vocab.meaning}</p>
          )}
        </div>

        {/* Delete button - show on hover */}
        {isHovered && (
          <button
            onClick={handleDelete}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 transition-colors"
            title="Delete vocab"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
