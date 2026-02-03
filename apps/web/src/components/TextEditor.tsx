"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { postJson } from "@/lib/api";
import { TokenizeResponse, Vocab } from "@/types";
import VocabModal from "./VocabModal";
import VocabTooltip from "./VocabTooltip";
import { PencilIcon, EyeIcon } from "@heroicons/react/24/outline";

interface TextEditorProps {
  textId: string | null;
  initialTitle?: string;
  initialContent?: string;
  initialSource?: string;
  vocabs: Vocab[];
  onUpdate: (data: { title: string; content: string; source: string }) => void;
  onSaveVocab: (data: {
    word: string;
    furigana: string;
    meaning: string;
    notes?: string;
    sentence: string;
  }) => Promise<void>;
  onSaveSentence?: (vocabId: string, sentence: string) => Promise<void>;
}

export default function TextEditor({
  textId,
  initialTitle = "",
  initialContent = "",
  initialSource = "",
  vocabs,
  onUpdate,
  onSaveVocab,
  onSaveSentence,
}: TextEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [source, setSource] = useState(initialSource);
  const [tokens, setTokens] = useState<TokenizeResponse["tokens"]>([]);
  const [loading, setLoading] = useState(false);
  const [isTitleManuallyEdited, setIsTitleManuallyEdited] = useState(false);
  // Set initial mode: view if has content, edit if empty
  const [editorMode, setEditorMode] = useState<"edit" | "view">(
    initialContent.trim() ? "view" : "edit"
  );

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<TokenizeResponse["tokens"][0] | null>(null);
  const [selectedTokenIndex, setSelectedTokenIndex] = useState<number | null>(null);
  const [existingVocab, setExistingVocab] = useState<Vocab | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update Local State when props change
  useEffect(() => {
    setTitle(initialTitle);
    setContent(initialContent);
    setSource(initialSource);
    setIsTitleManuallyEdited(!!initialTitle); // If has initial title, consider it edited

    // If there's content, tokenize it (mode already set to view on init)
    if (initialContent.trim()) {
      tokenizeText(initialContent);
    }
  }, [initialTitle, initialContent, initialSource]);

  // Tokenize Text
  const tokenizeText = useCallback(async (inputText: string) => {
    // Clear tokens if input is empty
    if (!inputText.trim()) {
      setTokens([]);
      return;
    }

    setLoading(true);
    try {
      const response = await postJson<TokenizeResponse>("/api/tokenize", { text: inputText });
      setTokens(response.tokens);
    } catch (error) {
      console.log("Process Error:", error);
      setTokens([]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    }
  }, []);

  // REMOVED: Auto-tokenize on content change
  // Now tokenization happens only on mode switch (edit → view)

  // Auto save (debounced)
  useEffect(() => {
    if (!textId) return;

    const timer = setTimeout(() => {
      onUpdate({
        title,
        content,
        source,
      });
    }, 1500);

    return () => {
      clearTimeout(timer);
    };
  }, [title, content, source, textId, onUpdate]);

  // Auto-fill title from first line if not manually edited
  useEffect(() => {
    if (!isTitleManuallyEdited && content) {
      const firstLine = content.split(/[。\n]/)[0].slice(0, 50);
      if (firstLine) {
        setTitle(firstLine);
      }
    }
  }, [content, isTitleManuallyEdited]);

  const isKnownVocab = (token: TokenizeResponse["tokens"][0]) => {
    if (!vocabs) return false;
    return vocabs.some((vocab) => vocab.word === token.basic_form);
  };

  const getVocabData = (token: TokenizeResponse["tokens"][0]) => {
    if (!vocabs) return null;
    return vocabs.find((vocab) => vocab.word === token.basic_form) || null;
  };

  // Extract sentence around selected token
  const getSentenceAroundToken = (tokenIndex: number | null) => {
    if (tokenIndex === null) return "";

    const punctuations = ["。", "！", "？", ".", ",", "?", "!"];
    let start = tokenIndex;
    let end = tokenIndex;

    // Find sentence boundaries (stop at punctuation or newline)
    while (
      start > 0 &&
      !punctuations.includes(tokens[start - 1].surface_form) &&
      tokens[start - 1].surface_form !== "\n"
    ) {
      start--;
    }
    while (
      end < tokens.length - 1 &&
      !punctuations.includes(tokens[end].surface_form) &&
      tokens[end].surface_form !== "\n"
    ) {
      end++;
    }
    if (end < tokens.length && punctuations.includes(tokens[end].surface_form)) {
      end++;
    }

    // Reconstruct sentence with whitespace preserved
    return tokens
      .slice(start, end)
      .map((t) => {
        // Skip newline tokens in sentence
        if (t.surface_form === "\n") return "";
        // Include whitespace before + token
        return (t.whitespace_before || "") + t.surface_form;
      })
      .join("");
  };

  const handleTokenClick = (token: TokenizeResponse["tokens"][0], index: number) => {
    setSelectedToken(token);
    setSelectedTokenIndex(index);

    // Find existing vocab for this token
    const existing = vocabs.find((vocab) => vocab.word === token.basic_form);
    setExistingVocab(existing || null);

    setIsModalOpen(true);
  };

  const toggleMode = () => {
    if (editorMode === "edit") {
      // Switching to view mode: tokenize the content
      tokenizeText(content);
      setEditorMode("view");
    } else {
      // Switching to edit mode
      setEditorMode("edit");
      // Focus on textarea after mode switch
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    }
  };

  // Keyboard shortcut: Cmd/Ctrl + E to toggle mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "e") {
        e.preventDefault();
        toggleMode();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editorMode, content]);

  return (
    <div className="h-full flex flex-col">
      {/* Title */}
      <div className="border-b border-line px-11 py-5 bg-panel">
        <input
          type="text"
          value={title}
          placeholder="Untitled"
          onChange={(e) => {
            setTitle(e.target.value);
            setIsTitleManuallyEdited(true); // Mark as manually edited
          }}
          className="w-full text-3xl font-semibold border-none outline-none focus:ring-0 p-0 bg-transparent"
        />
        <input
          type="text"
          value={source}
          placeholder="Source"
          onChange={(e) => setSource(e.target.value)}
          className="w-full text-sm text-muted border-none outline-none focus:ring-0 p-0 mt-2 bg-transparent"
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-11 py-6 gap-4 overflow-y-auto">
        {/* Mode Toggle Switch */}
        <div className="inline-flex items-center rounded-full bg-highlight p-1 border border-line self-start">
          <button
            onClick={() => setEditorMode("edit")}
            className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              editorMode === "edit" ? "bg-panel text-ink shadow-sm" : "text-muted hover:text-body"
            }`}
            title="Edit Mode (Cmd+E)"
          >
            <PencilIcon className="w-4 h-4" />
            <span>Edit</span>
          </button>
          <button
            onClick={() => setEditorMode("view")}
            className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              editorMode === "view" ? "bg-panel text-ink shadow-sm" : "text-muted hover:text-body"
            }`}
            title="View Mode (Cmd+E)"
          >
            <EyeIcon className="w-4 h-4" />
            <span>View</span>
          </button>
        </div>
        {editorMode === "edit" ? (
          // Edit Mode: Plain textarea (full height)
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter your Japanese text here...&#10;&#10;Switch to View mode to see tokenized text"
            className="flex-1 w-full p-5 rounded-2xl border border-line bg-card text-xl leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
        ) : (
          // View Mode: Tokenized text
          <div className="flex-1">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-accent border-t-transparent rounded-full"></div>
                <span className="ml-3 text-muted">Tokenizing...</span>
              </div>
            )}

            {!loading && tokens.length > 0 && (
              <div className="p-5 rounded-2xl border border-line bg-card shadow-card">
                <div className="text-xl leading-relaxed text-gray-900 whitespace-pre-wrap">
                  {tokens.map((token, index) => {
                    // Handle newlines
                    if (token.surface_form === "\n") {
                      return <br key={index} />;
                    }

                    const isKnown = isKnownVocab(token);
                    const vocabData = getVocabData(token);

                    // Render whitespace before token (preserves formatting)
                    const whitespaceElement = token.whitespace_before ? (
                      <span key={`ws-${index}`} className="whitespace-pre">
                        {token.whitespace_before}
                      </span>
                    ) : null;

                    // If known vocab, wrap with tooltip
                    if (isKnown && vocabData) {
                      return (
                        <React.Fragment key={index}>
                          {whitespaceElement}
                          <VocabTooltip
                            furigana={vocabData.furigana || token.reading}
                            meaning={vocabData.meaning || ""}
                          >
                            <span
                              className="cursor-pointer rounded-md px-1 transition-all inline-block bg-accent-soft hover:bg-highlight-strong text-ink"
                              onClick={() => handleTokenClick(token, index)}
                            >
                              {token.surface_form}
                            </span>
                          </VocabTooltip>
                        </React.Fragment>
                      );
                    }

                    // Unknown vocab - just show reading in browser title
                    return (
                      <React.Fragment key={index}>
                        {whitespaceElement}
                        <span
                          title={token.reading}
                          className="cursor-pointer rounded-md px-1 transition-all inline-block hover:bg-highlight"
                          onClick={() => handleTokenClick(token, index)}
                        >
                          {token.surface_form}
                        </span>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            )}

            {!loading && tokens.length === 0 && (
              <div className="p-8 text-center text-muted rounded-2xl border border-line bg-card">
                <p>No content to display. Switch to Edit mode to add text.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <VocabModal
        token={selectedToken}
        sentence={getSentenceAroundToken(selectedTokenIndex)}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onSaveVocab}
        existingVocab={existingVocab}
        onSaveSentence={onSaveSentence}
      />
    </div>
  );
}
