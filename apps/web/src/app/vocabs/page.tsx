"use client";
import { useVocabs } from "@/hooks";

export default function VocabsPage() {
  const { vocabs, isLoading, isError } = useVocabs();

  if (isLoading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Vocabulary List</h1>
        <div className="text-gray-600">Loading vocabularies...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Vocabulary List</h1>
        <div className="text-red-600 bg-red-50 border border-red-200 rounded p-4">
          Failed to load vocabularies. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Vocabulary List</h1>
      <p className="text-gray-600 mb-8">
        {vocabs.length} {vocabs.length === 1 ? "word" : "words"} saved
      </p>

      {vocabs.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-2">No vocabulary saved yet</p>
          <p className="text-sm text-gray-500">
            Start by pasting Japanese text and clicking on words to save them
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {vocabs.map((vocab) => (
            <div
              key={vocab.id}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-baseline gap-3 mb-2">
                    <h3 className="text-2xl font-medium text-gray-900">{vocab.word}</h3>
                    {vocab.furigana && (
                      <span className="text-sm text-gray-500">{vocab.furigana}</span>
                    )}
                  </div>
                  {vocab.meaning && <p className="text-gray-700 mb-1">{vocab.meaning}</p>}
                  {vocab.notes && <p className="text-sm text-gray-500">{vocab.notes}</p>}
                </div>

                <div className="text-xs text-gray-400">
                  {new Date(vocab.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
