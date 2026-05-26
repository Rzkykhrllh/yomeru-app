"use client";

import { useState, useRef, useEffect } from "react";
import { Text, Folder } from "@/types";
import { TrashIcon, FolderIcon } from "@heroicons/react/24/outline";

interface TextListItemProps {
  text: Text;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
  folders?: Folder[];
  onMoveToFolder?: (folderId: string | null) => void;
}

export default function TextListItem({
  text,
  isSelected,
  onClick,
  onDelete,
  folders = [],
  onMoveToFolder,
}: TextListItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showFolderMenu, setShowFolderMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", text.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete "${text.title || "Untitled"}"?`)) onDelete();
  };

  const handleFolderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowFolderMenu((prev) => !prev);
  };

  const handleMoveToFolder = (e: React.MouseEvent, folderId: string | null) => {
    e.stopPropagation();
    onMoveToFolder?.(folderId);
    setShowFolderMenu(false);
  };

  useEffect(() => {
    if (!showFolderMenu) return;
    const handle = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowFolderMenu(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [showFolderMenu]);

  return (
    <div
      draggable
      onDragStart={handleDragStart}
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
        {/* Left: title + meta */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-ink truncate">
            {text.title || "Untitled"}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            {text.source && (
              <span className="text-xs text-muted truncate">{text.source}</span>
            )}
            {text.folder && (
              <span className="inline-flex items-center gap-0.5 text-xs text-muted shrink-0">
                <FolderIcon className="w-3 h-3" />
                {text.folder.name}
              </span>
            )}
          </div>
        </div>

        {/* Right: actions on hover */}
        {isHovered && (
          <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
            {folders.length > 0 && onMoveToFolder && (
              <div className="relative" ref={menuRef}>
                <button
                  className="p-1 text-muted hover:text-ink transition-colors"
                  onClick={handleFolderClick}
                  title="Move to folder"
                >
                  <FolderIcon className="h-3.5 w-3.5" />
                </button>

                {showFolderMenu && (
                  <div className="absolute right-0 top-6 z-50 w-44 bg-card border border-line rounded-xl shadow-lg overflow-hidden">
                    <button
                      onClick={(e) => handleMoveToFolder(e, null)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-highlight transition-colors ${
                        !text.folderId ? "text-ink font-medium" : "text-muted"
                      }`}
                    >
                      No folder
                    </button>
                    <div className="border-t border-line" />
                    {folders.map((folder) => (
                      <button
                        key={folder.id}
                        onClick={(e) => handleMoveToFolder(e, folder.id)}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-highlight transition-colors ${
                          text.folderId === folder.id ? "text-ink font-medium" : "text-muted"
                        }`}
                      >
                        {folder.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button
              className="p-1 text-muted hover:text-danger transition-colors"
              onClick={handleDelete}
              title="Delete Text"
            >
              <TrashIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
