"use client";

import { useState, useEffect, useCallback } from "react";
import { postJson } from "@/lib/api";
import { TokenizeResponse } from "@/types";

export default function Home() {
  const [text, setText] = useState("");
  const [tokens, setTokens] = useState<TokenizeResponse["tokens"]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
  useEffect(() => {
    const timer = setTimeout(() => {
      processText(text);
    }, 800);

    return () => clearTimeout(timer);
  }, [text, processText]);

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
          <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
            <div className="text-xl leading-relaxed text-gray-900">
              {tokens.map((token, index) => (
                <span
                  key={index}
                  title={`${token.reading}`}
                  className="hover:bg-blue-100 hover:shadow-sm cursor-pointer rounded-sm px-0.5 transition-all inline-block"
                  onClick={() => {
                    // Nanti akan buka modal annotate
                    console.log("Clicked token:", token);
                  }}
                >
                  {token.surface_form}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
