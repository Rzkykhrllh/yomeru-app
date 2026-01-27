"use client";

import { useState } from "react";
import { Text } from "@/types";
import { TrashIcon } from "@heroicons/react/24/outline";

interface TextListItemProps {
  text: Text;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
}

export default function TextListItem({ text, isSelected, onClick, onDelete }: TextListItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering onClick of the list item

    if (confirm(`Delete "${text.title || "Untitled"}"?`)) {
      onDelete();
    }
  };

  // Preview of the text content (first 100 characters)
  const preview = text.content.length > 100 ? text.content.slice(0, 100) + "..." : text.content;

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
          <h3 className="font-medium text-gray-900 truncate">{text.title || "Untitled"}</h3>
          <p className="text-sm text-muted line-clamp-2 mt-1">{preview}</p>
          {text.source && <p className="text-sm text-muted mt-1">{text.source}</p>}
        </div>

        {/* Delete Button */}
        <button
          className={`absolute top-3 right-3 p-1 text-muted hover:text-ink transition-opacity ${
            isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={handleDelete}
          title="Delete Text"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
