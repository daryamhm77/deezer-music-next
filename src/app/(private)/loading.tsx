export default function PrivateLoading() {
  return (
    <div className="space-y-4 p-4">
      <div className="h-8 w-56 animate-pulse rounded bg-hover" />
      <div className="space-y-2">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="h-16 animate-pulse rounded-md bg-hover" />
        ))}
      </div>
    </div>
  );
}
