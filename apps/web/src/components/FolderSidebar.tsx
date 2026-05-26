"use client";

import { useState } from "react";
import { Folder } from "@/types";
import {
  FolderIcon,
  FolderOpenIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

interface FolderSidebarProps {
  folders: Folder[];
  selectedFolderId: string | null; // null = "All Texts"
  onSelectFolder: (folderId: string | null) => void;
  onCreateFolder: (name: string) => Promise<void>;
  onRenameFolder: (id: string, name: string) => Promise<void>;
  onDeleteFolder: (id: string) => Promise<void>;
}

export default function FolderSidebar({
  folders,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
}: FolderSidebarProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleCreate = async () => {
    const name = newFolderName.trim();
    if (!name) return;
    await onCreateFolder(name);
    setNewFolderName("");
    setIsCreating(false);
  };

  const handleRename = async (id: string) => {
    const name = editingName.trim();
    if (!name) return;
    await onRenameFolder(id, name);
    setEditingId(null);
  };

  const startEdit = (folder: Folder, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(folder.id);
    setEditingName(folder.name);
  };

  const handleDelete = async (folder: Folder, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete folder "${folder.name}"? Texts inside will be unfiled.`)) return;
    await onDeleteFolder(folder.id);
    if (selectedFolderId === folder.id) onSelectFolder(null);
  };

  return (
    <div className="w-48 border-r border-line bg-panel flex flex-col shrink-0">
      <div className="px-3 py-3 border-b border-line flex items-center justify-between">
        <span className="text-xs font-semibold text-muted uppercase tracking-wider">Folders</span>
        <button
          onClick={() => setIsCreating(true)}
          className="p-1 text-muted hover:text-ink rounded transition-colors"
          title="New folder"
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {/* All Texts */}
        <button
          onClick={() => onSelectFolder(null)}
          className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
            selectedFolderId === null
              ? "bg-accent-soft text-ink font-medium"
              : "text-muted hover:text-ink hover:bg-highlight"
          }`}
        >
          <DocumentTextIcon className="w-4 h-4 shrink-0" />
          <span className="truncate">All Texts</span>
        </button>

        {/* Folder list */}
        {folders.map((folder) => (
          <div
            key={folder.id}
            onMouseEnter={() => setHoveredId(folder.id)}
            onMouseLeave={() => setHoveredId(null)}
            className="group relative"
          >
            {editingId === folder.id ? (
              <div className="flex items-center gap-1 px-2 py-1">
                <input
                  autoFocus
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRename(folder.id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  className="flex-1 min-w-0 text-sm bg-surface border border-line rounded px-2 py-1 text-ink focus:outline-none focus:border-accent"
                />
                <button onClick={() => handleRename(folder.id)} className="p-1 text-accent hover:text-ink">
                  <CheckIcon className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setEditingId(null)} className="p-1 text-muted hover:text-ink">
                  <XMarkIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onSelectFolder(folder.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                  selectedFolderId === folder.id
                    ? "bg-accent-soft text-ink font-medium"
                    : "text-muted hover:text-ink hover:bg-highlight"
                }`}
              >
                {selectedFolderId === folder.id ? (
                  <FolderOpenIcon className="w-4 h-4 shrink-0" />
                ) : (
                  <FolderIcon className="w-4 h-4 shrink-0" />
                )}
                <span className="flex-1 truncate text-left">{folder.name}</span>
                {folder._count && (
                  <span className="text-xs text-muted">{folder._count.texts}</span>
                )}
              </button>
            )}

            {/* Hover actions */}
            {hoveredId === folder.id && editingId !== folder.id && (
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                <button
                  onClick={(e) => startEdit(folder, e)}
                  className="p-1 text-muted hover:text-ink rounded"
                  title="Rename"
                >
                  <PencilIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => handleDelete(folder, e)}
                  className="p-1 text-muted hover:text-danger rounded"
                  title="Delete"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ))}

        {/* New folder input */}
        {isCreating && (
          <div className="flex items-center gap-1 px-2 py-1 mt-1">
            <input
              autoFocus
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
                if (e.key === "Escape") {
                  setIsCreating(false);
                  setNewFolderName("");
                }
              }}
              className="flex-1 min-w-0 text-sm bg-surface border border-line rounded px-2 py-1 text-ink focus:outline-none focus:border-accent placeholder:text-muted"
            />
            <button onClick={handleCreate} className="p-1 text-accent hover:text-ink">
              <CheckIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setNewFolderName("");
              }}
              className="p-1 text-muted hover:text-ink"
            >
              <XMarkIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
