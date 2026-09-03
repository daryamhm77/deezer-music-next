export default function PublicLoading() {
  return (
    <div className="min-h-screen space-y-8 p-4">
      <div className="h-6 w-64 animate-pulse rounded bg-hover" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
        {[...Array(10)].map((_, index) => (
          <div key={index} className="h-44 animate-pulse rounded-md bg-hover" />
        ))}
      </div>
    </div>
  );
}
