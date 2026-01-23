export default function TextDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Text Detail</h1>
      <div className="text-gray-600">
        <p>Text ID: {params.id}</p>
        <p className="mt-2">Text content and vocab annotations will appear here.</p>
      </div>
    </div>
  );
}
