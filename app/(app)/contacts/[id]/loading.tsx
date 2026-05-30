export default function ContactDetailLoading() {
  return (
    <div className="flex flex-col h-full bg-[#faf6f0]">

      {/* ── Header skeleton ── */}
      <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-[#e4e0d8] bg-[#faf6f0] shrink-0">
        <div className="flex items-center gap-3">
          <div className="animate-pulse bg-[#e4e0d8] rounded-xl h-8 w-8" />
          <div className="animate-pulse bg-[#e4e0d8] rounded-lg h-5 w-40" />
        </div>
        <div className="animate-pulse bg-[#e4e0d8] rounded-xl h-8 w-8" />
      </div>

      {/* ── Body skeleton (dual layout) ── */}
      <div className="flex-1 overflow-hidden">

        {/* Desktop layout */}
        <div className="hidden md:flex h-full">
          {/* Left panel: 3 card skeletons */}
          <div className="w-80 shrink-0 border-r border-[#e4e0d8] overflow-y-auto p-4 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border border-[#e4e0d8] rounded-2xl p-4 space-y-3">
                <div className="animate-pulse bg-[#e4e0d8] rounded h-4 w-24" />
                <div className="space-y-2">
                  <div className="animate-pulse bg-[#e4e0d8] rounded h-3.5 w-full" />
                  <div className="animate-pulse bg-[#e4e0d8] rounded h-3.5 w-3/4" />
                  <div className="animate-pulse bg-[#e4e0d8] rounded h-3.5 w-1/2" />
                </div>
              </div>
            ))}
          </div>

          {/* Right panel: header + 5 timeline rows */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div className="animate-pulse bg-[#e4e0d8] rounded h-5 w-32" />
              <div className="animate-pulse bg-[#e4e0d8] rounded-xl h-8 w-32" />
            </div>
            <div className="space-y-3 pl-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-[#e4e0d8] rounded-xl h-12" />
              ))}
            </div>
          </div>
        </div>

        {/* Mobile layout */}
        <div className="flex md:hidden flex-col h-full overflow-y-auto">
          {/* 3 card skeletons */}
          <div className="p-4 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border border-[#e4e0d8] rounded-2xl p-4 space-y-3">
                <div className="animate-pulse bg-[#e4e0d8] rounded h-4 w-24" />
                <div className="space-y-2">
                  <div className="animate-pulse bg-[#e4e0d8] rounded h-3.5 w-full" />
                  <div className="animate-pulse bg-[#e4e0d8] rounded h-3.5 w-3/4" />
                </div>
              </div>
            ))}
          </div>
          {/* Timeline header + 5 rows */}
          <div className="px-4 pb-6 space-y-3">
            <div className="animate-pulse bg-[#e4e0d8] rounded h-5 w-32 mb-4" />
            <div className="space-y-3 pl-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-[#e4e0d8] rounded-xl h-12" />
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
