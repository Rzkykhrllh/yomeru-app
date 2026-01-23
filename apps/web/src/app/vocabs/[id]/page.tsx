export default function VocabDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Vocabulary Detail</h1>
      <div className="text-gray-600">
        <p>Vocab ID: {params.id}</p>
        <p className="mt-2">Details and sentence appearances will appear here</p>
      </div>
    </div>
  );
}
