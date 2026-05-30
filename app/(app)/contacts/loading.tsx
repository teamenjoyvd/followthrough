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
      {/* Outer wrapper matches ContactsDesktop: px-6 py-4 */}
      <div className="flex-1 overflow-hidden hidden md:block px-6 py-4 space-y-2">
        {/* Desktop column header — matches grid-cols-[40px_36px_2fr_2fr_1.5fr_1.5fr_80px] gap-4 px-4 */}
        <div className="grid grid-cols-[40px_36px_2fr_2fr_1.5fr_1.5fr_80px] gap-4 px-4 mb-1 items-center">
          <div className="animate-pulse bg-[#e4e0d8] rounded h-3.5 w-4 justify-self-center" />
          <div className="sr-only">Focused</div>
          <div className="animate-pulse bg-[#e4e0d8] rounded h-3.5 w-20" />
          <div className="animate-pulse bg-[#e4e0d8] rounded h-3.5 w-20" />
          <div className="animate-pulse bg-[#e4e0d8] rounded h-3.5 w-14" />
          <div className="animate-pulse bg-[#e4e0d8] rounded h-3.5 w-24" />
          <div className="sr-only">Actions</div>
        </div>
        {/* Desktop rows — match grid-cols-[40px_36px_2fr_2fr_1.5fr_1.5fr_80px] gap-4 px-4 py-3.5 rounded-[20px] */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-[40px_36px_2fr_2fr_1.5fr_1.5fr_80px] gap-4 items-center px-4 py-3.5 rounded-[20px] bg-[#f5f1ea]"
          >
            <div className="animate-pulse bg-[#e4e0d8] rounded h-4 w-4 justify-self-center" />
            <div className="animate-pulse bg-[#e4e0d8] rounded-xl h-9 w-9 justify-self-center" />
            <div className="space-y-2">
              <div className="animate-pulse bg-[#e4e0d8] rounded h-3.5 w-36" />
              <div className="animate-pulse bg-[#e4e0d8] rounded h-3 w-24" />
            </div>
            <div className="animate-pulse bg-[#e4e0d8] rounded h-3.5 w-28" />
            <div className="animate-pulse bg-[#e4e0d8] rounded-full h-5 w-16" />
            <div className="animate-pulse bg-[#e4e0d8] rounded h-3.5 w-20" />
            <div className="animate-pulse bg-[#e4e0d8] rounded-lg h-5 w-6 justify-self-end" />
          </div>
        ))}
      </div>

      {/* Mobile rows */}
      <div className="flex-1 overflow-hidden md:hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center px-4 py-3.5 border-b border-[#e4e0d8] gap-3"
          >
            <div className="animate-pulse bg-[#e4e0d8] rounded h-4 w-4 shrink-0" />
            <div className="animate-pulse bg-[#e4e0d8] rounded-full h-9 w-9 shrink-0" />
            <div className="flex-1 min-w-0 space-y-2">
              <div className="animate-pulse bg-[#e4e0d8] rounded h-3.5 w-36" />
              <div className="animate-pulse bg-[#e4e0d8] rounded h-3 w-24" />
            </div>
            <div className="animate-pulse bg-[#e4e0d8] rounded-lg h-7 w-7 shrink-0" />
          </div>
        ))}
      </div>

    </div>
  )
}
