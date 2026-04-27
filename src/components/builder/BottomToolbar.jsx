import { MousePointer2, Hand, Circle, Sun, Grid, ChevronDown } from 'lucide-react'
import { useState } from 'react'

const tools = [
  { icon: MousePointer2, id: 'cursor' },
  { icon: Hand, id: 'hand' },
  { icon: Circle, id: 'shape' },
  { icon: Sun, id: 'light' },
  { icon: Grid, id: 'grid' },
]

export default function BottomToolbar() {
  const [activeTool, setActiveTool] = useState('cursor')

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white border border-[#D8E1F0] rounded-2xl px-2 py-1.5 shadow-[0_18px_45px_rgba(35,72,215,0.12)]">
      {tools.map(({ icon: Icon, id }) => (
        <button
          key={id}
          onClick={() => setActiveTool(id)}
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
            activeTool === id
              ? 'bg-[#EEF3FF] text-[#2348D7]'
              : 'text-[#7D8CA8] hover:text-[#2348D7] hover:bg-[#F3F7FF]'
          }`}
        >
          <Icon size={15} />
        </button>
      ))}

      <div className="w-px h-5 bg-[#E1E8F5] mx-1" />

      <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#5E6F8E] hover:text-[#2348D7] rounded-xl hover:bg-[#F3F7FF] transition-colors">
        50%
        <ChevronDown size={12} />
      </button>

      <button className="px-3 py-1.5 text-sm text-[#2348D7] font-medium hover:bg-[#F3F7FF] rounded-xl transition-colors">
        Upgrade Now
      </button>
    </div>
  )
}
