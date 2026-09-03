export default function SearchLoading() {
  return (
    <div className="space-y-8 p-4">
      <div className="h-8 w-48 animate-pulse rounded bg-hover" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="h-44 animate-pulse rounded-md bg-hover" />
        ))}
      </div>
    </div>
  );
}
