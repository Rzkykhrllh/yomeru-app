"use client";

import { useState, useEffect, useCallback } from "react";
import { postJson } from "@/lib/api";
import { TokenizeResponse } from "@/types";
import { useCreateVocab, useCreateText } from "@/hooks";
import VocabModal from "@/components/VocabModal";
import SaveTextModal from "@/components/SaveTextModal";

export default function Home() {
  const [text, setText] = useState("");
  const [tokens, setTokens] = useState<TokenizeResponse["tokens"]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<TokenizeResponse["tokens"][0] | null>(null);
  const [selectedTokenIndex, setSelectedTokenIndex] = useState<number | null>(null);
  const [isSaveTextModalOpen, setIsSaveTextModalOpen] = useState(false);

  const { createVocab } = useCreateVocab();
  const { createText } = useCreateText();

  // TODO: Understand how this code below works, especially useCallback
  const processText = useCallback(async (inputText: string) => {
    if (!inputText.trim()) {
      setTokens([]);
      setError("");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await postJson<TokenizeResponse>("/api/tokenize", {
        text: inputText,
      });

      setTokens(response.tokens);
    } catch (err) {
      setError("Unable to process text. Please try again.");
      console.error("Process error:", err);
      setTokens([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-process text after user stops typing (debounce)
  // TODO: Understand how this code below works
  useEffect(() => {
    const timer = setTimeout(() => {
      processText(text);
    }, 800);

    return () => clearTimeout(timer);
  }, [text, processText]);

  // Extract sentence arround selected token
  const extractSentence = (tokenIndex: number | null): string => {
    if (tokenIndex === null) return "";

    const punctuations = ["。", "！", "？", ".", ",", "?", "!"];

    // find sentence boundaries
    let start = tokenIndex;
    let end = tokenIndex;

    while (start > 0 && !punctuations.includes(tokens[start - 1].surface_form)) {
      start--;
    }

    while (end < tokens.length - 1 && !punctuations.includes(tokens[end].surface_form)) {
      end++;
    }

    // include the punctuation at the end
    if (end < tokens.length && punctuations.includes(tokens[end].surface_form)) {
      end++;
    }

    // Concatenate toens to form the sentence
    return tokens
      .slice(start, end)
      .map((t) => t.surface_form)
      .join("");
  };

  const handleTokenClick = (token: TokenizeResponse["tokens"][0], index: number) => {
    setSelectedToken(token);
    setIsModalOpen(true);
    setSelectedTokenIndex(index);
  };

  const handleSaveVocab = async (data: {
    word: string;
    furigana: string;
    meaning: string;
    notes: string;
  }) => {
    try {
      await createVocab(data);
    } catch (error) {
      console.error("Error saving vocab:", error);
      throw error;
    }
  };

  const handleSaveText = async (data: { title: string; source?: string }) => {
    try {
      await createText({
        title: data.title,
        content: text,
        source: data.source,
      });

      // Show success feedback
      alert("Text saved successfully!");
    } catch (error) {
      console.error("Error saving text:", error);
      alert("Failed to save text. Please try again.");
      throw error;
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Read Japanese Text</h1>
      <p className="text-gray-600 mb-8">
        Paste or type Japanese text below. Click any word to save and annotate it.
      </p>
      <div className="space-y-6">
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full min-h-[200px] p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xl leading-relaxed resize-none"
            placeholder="私は日本語を勉強しています"
            disabled={loading}
          />
          {loading && (
            <div className="absolute top-4 right-4">
              <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>
        {error && (
          <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded p-3">
            {error}
          </div>
        )}
        {tokens.length > 0 && (
          <div className="space-y-4">
            <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
              <div className="text-xl leading-relaxed text-gray-900">
                {tokens.map((token, index) => {
                  // Render newline as <br>
                  if (token.surface_form === "\n") {
                    return <br key={index} />;
                  }

                  return (
                    <span
                      key={index}
                      title={`${token.reading}`}
                      className="hover:bg-blue-100 hover:shadow-sm cursor-pointer rounded-sm px-0.5 transition-all inline-block"
                      onClick={() => handleTokenClick(token, index)}
                    >
                      {token.surface_form}
                    </span>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => setIsSaveTextModalOpen(true)}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Save This Text
            </button>
          </div>
        )}
      </div>
      <VocabModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        token={selectedToken}
        sentence={extractSentence(selectedTokenIndex)}
        onSave={handleSaveVocab}
      />

      <SaveTextModal
        isOpen={isSaveTextModalOpen}
        onClose={() => setIsSaveTextModalOpen(false)}
        onSave={handleSaveText}
      />
    </div>
  );
}
