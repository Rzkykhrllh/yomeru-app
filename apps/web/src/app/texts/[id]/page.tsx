export default function TextDetailPage({ params }: { params: { id: string } }) {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Text Detail</h1>
        <div className="text-gray-600">
          Text ID: {params.id}
        </div>
      </div>
    </main>
  );
}
