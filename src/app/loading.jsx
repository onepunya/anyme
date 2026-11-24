// Skeleton: kerangka halaman muncul langsung selagi data dimuat
export default function Loading() {
  return (
    <div className="space-y-8 pb-10" aria-busy="true" aria-label="Memuat">
      <div className="skeleton h-[320px] md:h-[380px] border border-border" />
      <div>
        <div className="skeleton h-6 w-48 mb-4" />
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="border border-border bg-card">
              <div className="skeleton aspect-[2/3]" />
              <div className="p-2 space-y-2">
                <div className="skeleton h-3 w-full" />
                <div className="skeleton h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
