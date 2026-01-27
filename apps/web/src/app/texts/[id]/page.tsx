"use client";
import { useText } from "@/hooks";
export default function TextDetailPage({ params }: { params: { id: string } }) {
  const { text, isLoading, isError } = useText(params.id);
  if (isLoading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Text Detail</h1>
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }
  if (isError || !text) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Text Detail</h1>
        <div className="text-red-600 bg-red-50 border border-red-200 rounded p-4">
          Failed to load text. Please try again.
        </div>
      </div>
    );
  }
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{text.title}</h1>
        {text.source && <p className="text-gray-600 mb-4">Source: {text.source}</p>}
        <p className="text-sm text-gray-500">
          Saved on {new Date(text.createdAt).toLocaleDateString()}
        </p>
      </div>
      <div className="mb-8 p-6 bg-white border border-gray-200 rounded-lg">
        <p className="text-xl leading-relaxed text-gray-900">{text.content}</p>
      </div>
      <div>
        <h2 className="text-2xl font-semibold mb-4">Vocabulary in this text</h2>
        {text.vocabs && text.vocabs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {text.vocabs.map((vocab, index) => (
              <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-baseline gap-2 mb-2">
                  <h3 className="text-xl font-medium text-gray-900">{vocab.word}</h3>
                  {vocab.furigana && (
                    <span className="text-sm text-gray-500">{vocab.furigana}</span>
                  )}
                </div>
                <p className="text-sm text-gray-700 mb-1">{vocab.sentence}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No vocabulary annotations yet.</p>
        )}
      </div>
    </div>
  );
}
