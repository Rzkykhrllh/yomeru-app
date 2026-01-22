export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Paste Japanese Text</h1>
        <div className="space-y-4">
          <textarea
            className="w-full min-h-[200px] p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Paste your Japanese text here..."
          />
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Tokenize
          </button>
        </div>
      </div>
    </main>
  );
}
