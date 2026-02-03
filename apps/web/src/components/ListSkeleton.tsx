export default function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 rounded-2xl border border-line bg-card animate-pulse">
          <div className="h-5 bg-highlight rounded-lg w-3/4 mb-2" />
          <div className="h-4 bg-highlight rounded-lg w-1/2" />
        </div>
      ))}
    </>
  );
}
