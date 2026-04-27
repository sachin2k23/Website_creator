import { LayoutGrid, Archive, Plus, Users, Search } from 'lucide-react'

export default function Sidebar({ currentPage, onNavigate }) {
  const isDashboard = currentPage === 'dashboard'
  const isArchive = currentPage === 'archive'

  return (
    <div className="w-[240px] h-full bg-white border-r border-[#D7E1F5] flex flex-col px-3 py-4 shrink-0">
      {/* Workspace */}
      <div className="flex items-center gap-3 px-3 py-2 mb-4 hover:bg-[#F3F7FF] rounded-xl cursor-pointer">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2F6BFF] to-[#1637B8] shadow-[0_8px_18px_rgba(47,107,255,0.35)] flex items-center justify-center text-white text-2xl font-extrabold tracking-tight">
          PT
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[#0F2348] text-[22px] leading-none font-bold tracking-tight">Planyt</span>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-[#F7F9FD] border border-[#DFE6F2] rounded-xl px-3 py-2 mb-5">
        <Search size={14} className="text-[#94A3BD]" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent text-sm text-[#21395F] placeholder-[#94A3BD] outline-none w-full"
        />
      </div>

      {/* Projects Section */}
      <p className="text-[#6F7E99] text-xs font-medium uppercase tracking-widest px-3 mb-2">Projects</p>
      <nav className="flex flex-col gap-0.5">
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm w-full text-left transition-colors ${
            isDashboard
              ? 'bg-[#2348D7] text-white shadow-[0_8px_18px_rgba(35,72,215,0.22)]'
              : 'text-[#243754] hover:text-[#1637B8] hover:bg-[#F3F7FF]'
          }`}
        >
          <LayoutGrid size={14} />
          All
        </button>
        <button
          type="button"
          onClick={() => onNavigate('archive')}
          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm w-full text-left transition-colors ${
            isArchive
              ? 'bg-[#2348D7] text-white shadow-[0_8px_18px_rgba(35,72,215,0.22)]'
              : 'text-[#243754] hover:text-[#1637B8] hover:bg-[#F3F7FF]'
          }`}
        >
          <Archive size={14} />
          Archive
        </button>
        <button className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[#243754] hover:text-[#1637B8] hover:bg-[#F3F7FF] w-full text-left">
          <Plus size={14} />
          New Folder...
        </button>
      </nav>

      {/* Bottom */}
      <div className="mt-auto flex items-center justify-between px-3 py-2 gap-2">
        <button className="flex items-center gap-2 text-[#5E6F8E] hover:text-[#1637B8] text-sm transition-colors">
          <Users size={14} />
          <span className="hidden xl:inline">Invite your team</span>
          <span className="xl:hidden">Invite</span>
        </button>
        <button className="text-xs bg-[#EEF3FF] hover:bg-[#E3ECFF] text-[#3154DB] px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
          Copy Link
        </button>
      </div>
    </div>
  )
}
