export default function ContactsLoading() {
  return (
    <div className="min-h-screen bg-[#faf6f0] p-4 md:p-6 space-y-6 animate-pulse font-body flex flex-col h-full overflow-hidden">
      {/* Header Row Skeleton */}
      <div className="flex items-center justify-between pb-4 border-b border-[#e4e0d8]">
        <div className="h-8 w-36 bg-[#eae6de] rounded-xl" />
        <div className="flex gap-2">
          <div className="h-9 w-9 bg-[#eae6de] rounded-xl" />
          <div className="h-9 w-28 bg-[#eae6de] rounded-xl" />
        </div>
      </div>

      {/* Filters Bar Skeleton */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="h-8 flex-1 min-w-[200px] bg-[#eae6de] rounded-xl" />
        <div className="h-8 w-24 bg-[#eae6de] rounded-xl" />
        <div className="h-8 w-24 bg-[#eae6de] rounded-xl" />
        <div className="h-8 w-9 bg-[#eae6de] rounded-xl" />
      </div>

      {/* Row list table items skeleton */}
      <div className="space-y-3.5 flex-1 overflow-y-auto">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-16 bg-[#f5f1ea] border border-[#e4e0d8] rounded-[20px]" />
        ))}
      </div>
    </div>
  )
}
