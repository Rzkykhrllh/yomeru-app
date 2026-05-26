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
    if (confirm(`Delete "${text.title || "Untitled"}"?`)) {
      onDelete();
    }
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

  // Close menu when clicking outside
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

  const preview = text.content.length > 100 ? text.content.slice(0, 100) + "..." : text.content;

  return (
    <div
      draggable
      onDragStart={handleDragStart}
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
          <h3 className="font-medium text-ink truncate">{text.title || "Untitled"}</h3>
          <p className="text-sm text-muted line-clamp-2 mt-1">{preview}</p>
          {text.source && <p className="text-sm text-muted mt-1">{text.source}</p>}

          {/* Folder badge */}
          {text.folder && (
            <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-xs bg-highlight text-muted border border-line">
              <FolderIcon className="w-3 h-3" />
              {text.folder.name}
            </span>
          )}
        </div>
      </div>

      {/* Hover actions */}
      {isHovered && (
        <div className="absolute top-3 right-3 flex items-center gap-1">
          {/* Move to folder */}
          {folders.length > 0 && onMoveToFolder && (
            <div className="relative" ref={menuRef}>
              <button
                className="p-1 text-muted hover:text-ink transition-colors"
                onClick={handleFolderClick}
                title="Move to folder"
              >
                <FolderIcon className="h-4 w-4" />
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

          {/* Delete */}
          <button
            className="p-1 text-muted hover:text-ink transition-colors"
            onClick={handleDelete}
            title="Delete Text"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
