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
        group relative px-4 py-3 cursor-pointer border-b border-gray-200
        hover:bg-gray-50 transition-colors
        ${isSelected ? "bg-blue-50 border-l-4 border-l-blue-500" : ""}
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{text.title || "Untitled"}</h3>
          <p className="text-sm text-gray-600 line-clamp-2 mt-1">{preview}</p>
          {text.source && <p className="text-sm text-gray-400 mt-1">{text.source}</p>}
        </div>

        {/* Delete Button */}
        {isHovered && (
          <button
            className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 transition-colors"
            onClick={handleDelete}
            title="Delete Text"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
