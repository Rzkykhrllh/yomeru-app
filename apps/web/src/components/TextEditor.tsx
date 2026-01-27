"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { postJson } from "@/lib/api";
import { TokenizeResponse, Vocab } from "@/types";
import VocabModal from "./VocabModal";
import VocabTooltip from "./VocabTooltip";

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

  // Auto-tokenize on content change
  useEffect(() => {
    const timer = setTimeout(() => {
      tokenizeText(content);
    }, 800);

    return () => clearTimeout(timer);
  }, [content, tokenizeText]);

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
    while (start > 0 && 
           !punctuations.includes(tokens[start - 1].surface_form) &&
           tokens[start - 1].surface_form !== "\n") {
      start--;
    }
    while (end < tokens.length - 1 && 
           !punctuations.includes(tokens[end].surface_form) &&
           tokens[end].surface_form !== "\n") {
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

  return (
      <div className="h-full flex flex-col">
        {/* Title */}
        <div className="border-b border-line px-6 py-5 bg-panel">
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
            placeholder="Untitled"
            onChange={(e) => setSource(e.target.value)}
            className="w-full text-sm text-muted border-none outline-none focus:ring-0 p-0 mt-2 bg-transparent"
          />
        </div>

      {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your Japanese text here..."
              className="w-full min-h-[220px] p-5 rounded-2xl border border-line bg-card text-xl leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              aria-busy={loading}
            />

          {loading && (
            <div className="absolute top-4 right-4">
              <div className="animate-spin h-5 w-5 border-2 border-accent border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>

        {/* TODO: Continue from here */}
        {tokens.length > 0 && (
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
