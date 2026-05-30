export default function ContactsLoading() {
  return (
    <div className="flex flex-col h-full bg-[#faf6f0]">

      {/* ── Mobile header skeleton ── */}
      <div className="flex md:hidden items-center justify-between px-4 py-3 border-b border-[#e4e0d8] bg-[#faf6f0] shrink-0">
        <div className="animate-pulse bg-[#e4e0d8] rounded-lg h-7 w-24" />
        <div className="flex items-center gap-2">
          <div className="animate-pulse bg-[#e4e0d8] rounded-xl h-9 w-9" />
          <div className="animate-pulse bg-[#e4e0d8] rounded-xl h-9 w-28" />
        </div>
      </div>

      {/* ── Desktop header + filter bar skeleton ── */}
      <div className="hidden md:flex items-start justify-between gap-4 px-4 md:px-6 py-3 border-b border-[#e4e0d8] bg-[#faf6f0] shrink-0">
        <div className="animate-pulse bg-[#e4e0d8] rounded-lg h-8 w-28 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
          <div className="animate-pulse bg-[#e4e0d8] rounded-full h-7 w-20" />
          <div className="animate-pulse bg-[#e4e0d8] rounded-full h-7 w-28" />
          <div className="animate-pulse bg-[#e4e0d8] rounded-full h-7 w-24" />
          <div className="animate-pulse bg-[#e4e0d8] rounded-full h-7 w-32" />
        </div>
        <div className="flex items-center gap-2 shrink-0 mt-0.5">
          <div className="animate-pulse bg-[#e4e0d8] rounded-xl h-9 w-9" />
          <div className="animate-pulse bg-[#e4e0d8] rounded-xl h-9 w-32" />
        </div>
      </div>

      {/* ── Contact row skeletons ── */}
      <div className="flex-1 overflow-hidden">
        {/* Desktop table header */}
        <div className="hidden md:flex items-center px-6 py-2.5 border-b border-[#e4e0d8] gap-4">
          <div className="animate-pulse bg-[#e4e0d8] rounded h-3.5 w-4" />
          <div className="animate-pulse bg-[#e4e0d8] rounded h-3.5 w-24" />
          <div className="animate-pulse bg-[#e4e0d8] rounded h-3.5 w-20 ml-auto" />
          <div className="animate-pulse bg-[#e4e0d8] rounded h-3.5 w-16" />
          <div className="animate-pulse bg-[#e4e0d8] rounded h-3.5 w-20" />
        </div>
        {/* Rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center px-4 md:px-6 py-3.5 border-b border-[#e4e0d8] gap-3 md:gap-4"
          >
            <div className="animate-pulse bg-[#e4e0d8] rounded h-4 w-4 shrink-0" />
            <div className="animate-pulse bg-[#e4e0d8] rounded-full h-9 w-9 shrink-0" />
            <div className="flex-1 min-w-0 space-y-2">
              <div className="animate-pulse bg-[#e4e0d8] rounded h-3.5 w-36" />
              <div className="animate-pulse bg-[#e4e0d8] rounded h-3 w-24" />
            </div>
            <div className="hidden md:block animate-pulse bg-[#e4e0d8] rounded-full h-5 w-16" />
            <div className="hidden md:block animate-pulse bg-[#e4e0d8] rounded h-3.5 w-20" />
            <div className="animate-pulse bg-[#e4e0d8] rounded-lg h-7 w-7 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}
