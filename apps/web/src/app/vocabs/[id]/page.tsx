"use client";
import { useVocab } from "@/hooks";
export default function VocabDetailPage({ params }: { params: { id: string } }) {
  const { vocab, isLoading, isError } = useVocab(params.id);
  if (isLoading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Vocabulary Detail</h1>
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }
  if (isError || !vocab) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Vocabulary Detail</h1>
        <div className="text-red-600 bg-red-50 border border-red-200 rounded p-4">
          Failed to load vocabulary. Please try again.
        </div>
      </div>
    );
  }
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{vocab.word}</h1>
        {vocab.furigana && <p className="text-xl text-gray-600 mb-4">{vocab.furigana}</p>}
        {vocab.meaning && (
          <p className="text-lg text-gray-700 mb-2">
            <span className="font-medium">Meaning:</span> {vocab.meaning}
          </p>
        )}
        {vocab.notes && (
          <p className="text-gray-600">
            <span className="font-medium">Notes:</span> {vocab.notes}
          </p>
        )}
      </div>
      <div>
        <h2 className="text-2xl font-semibold mb-4">Appearances</h2>
        {vocab.appearances && vocab.appearances.length > 0 ? (
          <div className="space-y-4">
            {vocab.appearances.map((appearance, index) => (
              <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-lg text-gray-900 mb-2 leading-relaxed">{appearance.sentence}</p>
                <p className="text-sm text-gray-500">From: {appearance.text_title}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No appearances found in saved texts yet.</p>
        )}
      </div>
    </div>
  );
}
