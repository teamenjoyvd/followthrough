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
          <div key={i} className="h-16 bg-[#f5f1ea] border border-[#e4e0d8] rounded-[20px] p-4 flex items-center">
            {/* Desktop: columns (similar to table layout) */}
            <div className="hidden md:flex items-center gap-6 w-full h-full">
              {/* Checkbox placeholder */}
              <div className="h-4 w-4 bg-[#eae6de] rounded shrink-0" />
              {/* Avatar + Name */}
              <div className="flex items-center gap-2.5 w-1/4 shrink-0">
                <div className="h-7 w-7 rounded-xl bg-[#eae6de] shrink-0" />
                <div className="h-4 w-28 bg-[#eae6de] rounded" />
              </div>
              {/* Company */}
              <div className="h-4 w-1/5 bg-[#eae6de] rounded shrink-0" />
              {/* Email */}
              <div className="h-4 flex-1 bg-[#eae6de] rounded min-w-0" />
              {/* Phone */}
              <div className="h-4 w-32 bg-[#eae6de] rounded shrink-0" />
              {/* Labels */}
              <div className="flex gap-1.5 w-24 shrink-0 justify-end">
                <div className="h-4 w-10 bg-[#eae6de] rounded-md" />
                <div className="h-4 w-10 bg-[#eae6de] rounded-md" />
              </div>
              {/* Action trigger */}
              <div className="h-7 w-7 rounded-xl bg-[#eae6de] shrink-0 ml-2" />
            </div>
            {/* Mobile: card layout */}
            <div className="md:hidden flex items-center justify-between w-full h-full">
              <div className="flex items-center gap-2.5 overflow-hidden">
                {/* Avatar */}
                <div className="h-9 w-9 rounded-full bg-[#eae6de] shrink-0" />
                <div className="space-y-1.5">
                  <div className="h-4 w-32 bg-[#eae6de] rounded" />
                  <div className="h-3.5 w-20 bg-[#eae6de] rounded" />
                </div>
              </div>
              <div className="h-7 w-7 rounded-xl bg-[#eae6de] shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
