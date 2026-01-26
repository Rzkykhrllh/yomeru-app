"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { postJson } from "@/lib/api";
import { TokenizeResponse, Vocab } from "@/types";
import VocabModal from "./VocabModal";

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
  }) => Promise<void>;
}

export default function TextEditor({
  textId,
  initialTitle = "",
  initialContent = "",
  initialSource = "",
  vocabs,
  onUpdate,
  onSaveVocab,
}: TextEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [source, setSource] = useState(initialSource);
  const [tokens, setTokens] = useState<TokenizeResponse["tokens"]>([]);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<TokenizeResponse["tokens"][0] | null>(null);
  const [selectedTokenIndex, setSelectedTokenIndex] = useState<number | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update Local State when props change
  useEffect(() => {
    setTitle(initialTitle);
    setContent(initialContent);
    setSource(initialSource);
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

  // Auto-fill title from first line if empty
  useEffect(() => {
    if (!title && content) {
      const firstLine = content.split(/[。\n]/)[0].slice(0, 50);
      if (firstLine) {
        setTitle(firstLine);
      }
    }
  }, [content, title]);

  const isKnownVocab = (token: TokenizeResponse["tokens"][0]) => {
    if (!vocabs) return false;
    return vocabs.some((vocab) => vocab.word === token.basic_form);
  };

  // Extract sentence around selected token
  const getSentenceAroundToken = (tokenIndex: number | null) => {
    if (tokenIndex === null) return "";

    const punctuations = ["。", "！", "？", ".", ",", "?", "!"];
    let start = tokenIndex;
    let end = tokenIndex;

    while (start > 0 && !punctuations.includes(tokens[start - 1].surface_form)) {
      start--;
    }
    while (end < tokens.length - 1 && !punctuations.includes(tokens[end].surface_form)) {
      end++;
    }
    if (end < tokens.length && punctuations.includes(tokens[end].surface_form)) {
      end++;
    }

    return tokens
      .slice(start, end)
      .map((t) => t.surface_form)
      .join("");
  };

  const handleTokenClick = (token: TokenizeResponse["tokens"][0], index: number) => {
    setSelectedToken(token);
    setSelectedTokenIndex(index);
    setIsModalOpen(true);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Title */}
      <div className="border-b border-gray-200 px-6 py-4">
        <input
          type="text"
          value={title}
          placeholder="Untitled"
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-3xl font-bold border-none outline-none focus:ring-0 p-0"
        />
        <input
          type="text"
          value={source}
          placeholder="Untitled"
          onChange={(e) => setSource(e.target.value)}
          className="w-full text-sm text-gray-500 border-none outline-none focus:ring-0 p-0 mt-2"
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter your Japanese text here..."
            className="w-full min-h-[200px] p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xl leading-relaxed resize-none"
            aria-busy={loading}
          />

          {loading && (
            <div className="absolute top-4 right-4">
              <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>

        {/* TODO: Continue from here */}
        {tokens.length > 0 && (
          <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
            <div className="text-xl leading-relaxed text-gray-900">
              {tokens.map((token, index) => {
                if (token.surface_form === "\n") {
                  return <br key={index} />;
                }

                const isKnown = isKnownVocab(token);

                return (
                  <span
                    key={index}
                    title={`${token.reading}${isKnown ? " (Known)" : ""}`}
                    className={`cursor-pointer rounded-sm px-0.5 transition-all inline-block ${
                      isKnown
                        ? "bg-green-100 hover:bg-green-200 text-green-900"
                        : "hover:bg-blue-100 hover:shadow-sm"
                    }`}
                    onClick={() => handleTokenClick(token, index)}
                  >
                    {token.surface_form}
                  </span>
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
      />
    </div>
  );
}
