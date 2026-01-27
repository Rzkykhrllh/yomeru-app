"use client";

import { useVocab } from "@/hooks";
import Link from "next/link";

interface VocabDetailProps {
  vocabId: string;
}

export default function VocabDetail({ vocabId }: VocabDetailProps) {
  const { vocab, isLoading, isError } = useVocab(vocabId);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (isError || !vocab) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-red-600">Failed to load vocabulary</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-6 py-4">
      {/* Vocab Info */}
      <div className="mb-8">
        <div className="flex items-baseline gap-3 mb-4">
          <h1 className="text-4xl font-bold text-gray-900">{vocab.word}</h1>
          {vocab.furigana && (
            <span className="text-xl text-gray-600">{vocab.furigana}</span>
          )}
        </div>

        {vocab.meaning && (
          <div className="mb-3">
            <span className="text-sm font-medium text-gray-700">Meaning: </span>
            <span className="text-lg text-gray-800">{vocab.meaning}</span>
          </div>
        )}

        {vocab.notes && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <span className="text-sm font-medium text-gray-700 block mb-1">Notes:</span>
            <p className="text-gray-700">{vocab.notes}</p>
          </div>
        )}
      </div>

      {/* Appearances */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Appearances {vocab.appearances && `(${vocab.appearances.length})`}
        </h2>

        {vocab.appearances && vocab.appearances.length > 0 ? (
          <div className="space-y-3">
            {vocab.appearances.map((appearance, index) => (
              <Link
                key={index}
                href={`/texts?id=${appearance.textId}`}
                className="block p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-300 transition-all"
              >
                {/* Text Title + Source */}
                <div className="flex items-baseline gap-2 mb-2">
                  <h3 className="font-medium text-gray-900">
                    {appearance.textTitle || "Untitled"}
                  </h3>
                  {appearance.textSource && (
                    <span className="text-sm text-gray-500">• {appearance.textSource}</span>
                  )}
                </div>

                {/* Sentence */}
                <p className="text-gray-700 leading-relaxed">
                  "{appearance.sentence}"
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600">No appearances in saved texts yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Save this vocab from a text to see it here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
