import { Database, Plus, Settings, Play, Users, Sparkles, RotateCcw, RotateCw, Download } from 'lucide-react'

export default function CanvasTopbar({ onBack, onInsertClick, onUndo, onRedo, canUndo, canRedo, onPreview, onExport, projectName = 'My Project' }) {
  return (
    <div className="h-14 bg-white border-b border-[#D8E1F0] flex items-center justify-between px-3 sm:px-4 shrink-0">
      <div className="flex items-center gap-1 min-w-0 overflow-x-auto">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-[#EEF3FF] hover:bg-[#E3ECFF] flex items-center justify-center text-[#2348D7] transition-colors mr-1 shrink-0"
        >
          <Sparkles size={16} />
        </button>

        {/* Insert — has its own click handler */}
        <button
          onClick={onInsertClick}
          className="flex items-center gap-1.5 px-3 py-2 text-sm text-[#5E6F8E] hover:text-[#2348D7] hover:bg-[#F3F7FF] rounded-xl transition-colors whitespace-nowrap"
        >
          <Plus size={13} />
          Insert
        </button>

        {/* Undo/Redo buttons */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl transition-colors whitespace-nowrap ${
            canUndo
              ? 'text-[#5E6F8E] hover:text-[#2348D7] hover:bg-[#F3F7FF] cursor-pointer'
              : 'text-[#BFC8E0] cursor-not-allowed'
          }`}
          title="Undo (Ctrl+Z)"
        >
          <RotateCcw size={13} />
          Undo
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl transition-colors whitespace-nowrap ${
            canRedo
              ? 'text-[#5E6F8E] hover:text-[#2348D7] hover:bg-[#F3F7FF] cursor-pointer'
              : 'text-[#BFC8E0] cursor-not-allowed'
          }`}
          title="Redo (Ctrl+Y)"
        >
          <RotateCw size={13} />
          Redo
        </button>

        <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-[#5E6F8E] hover:text-[#2348D7] hover:bg-[#F3F7FF] rounded-xl transition-colors whitespace-nowrap">
          <Database size={13} />
          CMS
        </button>
      </div>

      <div className="hidden md:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
        <span className="text-[#0F2348] text-sm font-semibold">{projectName}</span>
        <span className="text-[#6F7E99] text-xs border border-[#D8E1F0] bg-[#FBFCFF] px-2 py-0.5 rounded-lg">FREE</span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="w-8 h-8 rounded-full bg-[#2F6BFF] flex items-center justify-center text-white text-xs font-bold">S</div>
        <button className="w-9 h-9 rounded-xl hover:bg-[#F3F7FF] flex items-center justify-center text-[#7D8CA8] hover:text-[#2348D7] transition-colors">
          <Settings size={15} />
        </button>
        <button
          onClick={onPreview}
          className="hidden sm:flex w-8 h-8 rounded-xl hover:bg-[#F3F7FF] items-center justify-center text-[#7D8CA8] hover:text-[#2348D7] transition-colors"
          title="Preview"
        >
          <Play size={13} />
        </button>
        <button className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-sm text-[#5E6F8E] border border-[#D8E1F0] rounded-xl hover:bg-[#F3F7FF] transition-colors">
          <Users size={13} />
          Invite
        </button>
        <button
          onClick={onExport}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#5E6F8E] border border-[#D8E1F0] rounded-xl hover:bg-[#F3F7FF] transition-colors"
          title="Export as HTML"
        >
          <Download size={12} />
          Export
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2 text-sm text-white font-medium bg-[#2348D7] hover:bg-[#1B3FC8] rounded-xl transition-colors shadow-[0_8px_18px_rgba(35,72,215,0.18)]">
          Publish
        </button>
      </div>
    </div>
  )
}
