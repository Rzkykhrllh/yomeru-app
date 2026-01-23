"use client";

import { useState } from "react";
import { postJson } from "@/lib/api";
import { TokenizeResponse } from "@/types";

export default function Home() {
  const [text, setText] = useState("");
  const [tokens, setTokens] = useState<TokenizeResponse["tokens"]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTokenize = async () => {
    if (!text.trim()) {
      setError("Please enter some text to tokenize.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await postJson<TokenizeResponse>("/api/tokenize", {
        text,
      });
      setTokens(response.tokens);
    } catch (err) {
      setError("Failed to tokenize text. Please try again.");
      console.error("Tokenize error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Paste Japanese Text</h1>
        <div className="space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full min-h-[200px] p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Paste your Japanese text here..."
            disabled={loading}
          />

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            onClick={handleTokenize}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Tokenizing..." : "Tokenize"}
          </button>

          {tokens.length > 0 && (
            <div className="mt-6 p-4 border border-gray-200 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Tokens</h2>
              <div className="flex flex-wrap gap-2">
                {tokens.map((token, index) => (
                  <div
                    key={index}
                    title={`POS: ${token.pos}, Reading: ${token.reading}`}
                    className="px-3 py-1 bg-gray-100 rounded border border-gray-300 hover:bg-gray-200 cursor-pointer"
                  >
                    {token.surface_form}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
