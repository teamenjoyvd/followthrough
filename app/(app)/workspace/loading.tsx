export default function WorkspaceLoading() {
  return (
    <div className="min-h-screen bg-[#faf6f0] p-4 md:p-8 space-y-6 animate-pulse font-body">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between pb-4 border-b border-[#e4e0d8]">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-[#eae6de] rounded-xl" />
          <div className="h-4 w-32 bg-[#eae6de]/70 rounded-lg" />
        </div>
        <div className="h-10 w-10 bg-[#eae6de] rounded-full" />
      </div>

      {/* Stats Cards Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-[#f5f1ea] border border-[#e4e0d8] rounded-[20px] p-4 space-y-2" />
        ))}
      </div>

      {/* Content list placeholder */}
      <div className="space-y-3 pt-4">
        <div className="h-6 w-36 bg-[#eae6de] rounded-lg mb-4" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-[#f5f1ea] border border-[#e4e0d8] rounded-[20px] p-4" />
        ))}
      </div>
    </div>
  )
}
