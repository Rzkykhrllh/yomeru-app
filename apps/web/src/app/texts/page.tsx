"use client";

import { useTexts } from "@/hooks";

export default function TextsPage() {
  const { texts, isLoading, isError } = useTexts();
  if (isLoading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Saved Texts</h1>
        <div className="text-gray-600">Loading texts...</div>
      </div>
    );
  }
  if (isError) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Saved Texts</h1>
        <div className="text-red-600 bg-red-50 border border-red-200 rounded p-4">
          Failed to load texts. Please try again.
        </div>
      </div>
    );
  }
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Saved Texts</h1>
      <p className="text-gray-600 mb-8">
        {texts.length} {texts.length === 1 ? "text" : "texts"} saved
      </p>
      {texts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-2">No texts saved yet</p>
          <p className="text-sm text-gray-500">
            Paste Japanese text on the home page to get started
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {texts.map((text) => (
            <div
              key={text.id}
              className="p-5 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-semibold text-gray-900">{text.title}</h3>
                <div className="text-xs text-gray-400">
                  {new Date(text.created_at).toLocaleDateString()}
                </div>
              </div>
              <p className="text-gray-700 line-clamp-3 leading-relaxed mb-2">{text.content}</p>
              {text.source && <p className="text-sm text-gray-500">Source: {text.source}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
