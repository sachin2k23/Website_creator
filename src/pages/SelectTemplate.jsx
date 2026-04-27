import { ArrowLeft } from 'lucide-react'

const TEMPLATE_CARDS = [
  {
    key: 'blank',
    name: 'Blank',
    description: 'Start from scratch',
    preview: (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-dashed border-[#C5D0E4] flex items-center justify-center">
          <span className="text-[#C5D0E4] text-2xl leading-none mb-0.5">+</span>
        </div>
      </div>
    ),
    bg: '#F7F9FD',
  },
  {
    key: 'portfolio',
    name: 'Portfolio',
    description: 'Showcase your work',
    preview: (
      <div className="w-full h-full p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between mb-1">
          <div className="w-16 h-2.5 bg-[#0F2348] rounded-full" />
          <div className="flex gap-1.5">
            <div className="w-8 h-1.5 bg-[#D8E1F0] rounded-full" />
            <div className="w-8 h-1.5 bg-[#D8E1F0] rounded-full" />
            <div className="w-8 h-1.5 bg-[#D8E1F0] rounded-full" />
          </div>
        </div>
        <div className="w-3/4 h-4 bg-[#0F2348] rounded-full mt-2" />
        <div className="w-1/2 h-2.5 bg-[#D8E1F0] rounded-full" />
        <div className="flex gap-1.5 mt-1">
          <div className="w-16 h-5 bg-[#0F2348] rounded-full" />
          <div className="w-16 h-5 border border-[#0F2348] rounded-full" />
        </div>
        <div className="flex gap-2 mt-auto">
          <div className="flex-1 h-12 bg-[#EEF3FF] rounded-lg" />
          <div className="flex-1 h-12 bg-[#F3F6FB] rounded-lg" />
          <div className="flex-1 h-12 bg-[#FFF0EE] rounded-lg" />
        </div>
      </div>
    ),
    bg: '#ffffff',
  },
  {
    key: 'landing',
    name: 'Landing Page',
    description: 'Convert visitors',
    preview: (
      <div className="w-full h-full flex flex-col">
        <div className="w-full h-8 bg-[#2348D7] flex items-center px-3 justify-between shrink-0">
          <div className="w-12 h-1.5 bg-white rounded-full opacity-80" />
          <div className="w-10 h-3 bg-white rounded-md opacity-90" />
        </div>
        <div className="flex-1 bg-white flex flex-col items-center justify-center gap-1.5 p-3">
          <div className="w-3/4 h-3 bg-[#0F2348] rounded-full" />
          <div className="w-1/2 h-2 bg-[#D8E1F0] rounded-full" />
          <div className="w-24 h-5 bg-[#2348D7] rounded-full mt-1" />
        </div>
        <div className="w-full bg-[#F7F9FD] p-2 flex gap-1.5 shrink-0">
          <div className="flex-1 h-8 bg-white rounded-lg border border-[#E2E8F4]" />
          <div className="flex-1 h-8 bg-white rounded-lg border border-[#E2E8F4]" />
          <div className="flex-1 h-8 bg-white rounded-lg border border-[#E2E8F4]" />
        </div>
      </div>
    ),
    bg: '#ffffff',
  },
  {
    key: 'blog',
    name: 'Blog',
    description: 'Share your writing',
    preview: (
      <div className="w-full h-full p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F4]">
          <div className="w-20 h-2.5 bg-[#0F2348] rounded-full" />
          <div className="flex gap-1">
            <div className="w-6 h-1.5 bg-[#D8E1F0] rounded-full" />
            <div className="w-6 h-1.5 bg-[#D8E1F0] rounded-full" />
            <div className="w-6 h-1.5 bg-[#D8E1F0] rounded-full" />
          </div>
        </div>
        <div className="w-full h-16 bg-[#EEF3FF] rounded-lg" />
        <div className="w-2/3 h-2.5 bg-[#0F2348] rounded-full" />
        <div className="w-full h-1.5 bg-[#E2E8F4] rounded-full" />
        <div className="w-4/5 h-1.5 bg-[#E2E8F4] rounded-full" />
        <div className="flex gap-1.5 mt-auto">
          <div className="flex-1 h-10 bg-[#F3F6FB] rounded-lg" />
          <div className="flex-1 h-10 bg-[#F3F6FB] rounded-lg" />
          <div className="flex-1 h-10 bg-[#F3F6FB] rounded-lg" />
        </div>
      </div>
    ),
    bg: '#ffffff',
  },
  {
    key: 'agency',
    name: 'Agency',
    description: 'Win more clients',
    preview: (
      <div className="w-full h-full p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between mb-1">
          <div className="w-14 h-2.5 bg-[#0F2348] rounded-full" />
          <div className="w-14 h-4 bg-[#2348D7] rounded-lg" />
        </div>
        <div className="w-full h-3 bg-[#0F2348] rounded-full mt-1" />
        <div className="w-3/4 h-3 bg-[#0F2348] rounded-full" />
        <div className="w-1/2 h-2 bg-[#D8E1F0] rounded-full mt-1" />
        <div className="flex gap-1.5 mt-auto">
          <div className="flex-1 h-10 bg-[#F3F6FB] rounded-lg border border-[#E2E8F4]" />
          <div className="flex-1 h-10 bg-[#F3F6FB] rounded-lg border border-[#E2E8F4]" />
        </div>
      </div>
    ),
    bg: '#ffffff',
  },
]

export default function SelectTemplate({ onSelect, onBack }) {
  return (
    <div className="min-h-screen bg-[#F7F9FD] px-10 py-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[#8A9ABB] hover:text-[#2348D7] text-sm mb-6 transition-colors"
      >
        <ArrowLeft size={14} />
        Back
      </button>

      <h1 className="text-[#0F2348] text-3xl font-bold mb-1">New Project</h1>
      <p className="text-[#8A9ABB] text-sm mb-8">Choose a template to get started</p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {TEMPLATE_CARDS.map((card) => (
          <div
            key={card.key}
            onClick={() => onSelect(card.key)}
            className="cursor-pointer group"
          >
            <div
              className="w-full aspect-[4/3] rounded-2xl border-2 border-[#E2E8F4] group-hover:border-[#2348D7] overflow-hidden transition-all duration-200 group-hover:shadow-lg group-hover:shadow-[#2348D7]/10 mb-3"
              style={{ backgroundColor: card.bg }}
            >
              {card.preview}
            </div>

            <p className="text-[#0F2348] text-sm font-semibold group-hover:text-[#2348D7] transition-colors">
              {card.name}
            </p>
            <p className="text-[#AAB8D4] text-xs mt-0.5">{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
