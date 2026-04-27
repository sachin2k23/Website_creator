import { useEffect, useRef } from 'react'
import {
  BringToFront, SendToBack,
  ArrowUp, ArrowDown,
  Copy, Trash2
} from 'lucide-react'

export default function ContextMenu({ x, y, elementId, onReorder, onDuplicate, onDelete, onClose }) {
  const ref = useRef(null)

  // Adjust position so menu doesn't go off screen
  useEffect(() => {
    if (!ref.current) return
    const menu = ref.current
    const rect = menu.getBoundingClientRect()
    if (rect.right > window.innerWidth) {
      menu.style.left = `${x - rect.width}px`
    }
    if (rect.bottom > window.innerHeight) {
      menu.style.top = `${y - rect.height}px`
    }
  }, [x, y])

  const handleAction = (fn) => {
    fn()
    onClose()
  }

  const Item = ({ icon: Icon, label, onClick, danger, divider }) => (
    <>
      {divider && <div style={{ height: 1, backgroundColor: '#EEF2FA', margin: '4px 0' }} />}
      <button
        onClick={() => handleAction(onClick)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '100%',
          padding: '6px 12px',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          fontSize: 12,
          color: danger ? '#ef4444' : '#1F2C44',
          borderRadius: 6,
          textAlign: 'left',
          transition: 'background 0.1s',
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = danger ? '#fff5f5' : '#F3F7FF'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <Icon size={13} />
        {label}
      </button>
    </>
  )

  return (
    <div
      ref={ref}
      onClick={e => e.stopPropagation()}
      style={{
        position: 'fixed',
        top: y,
        left: x,
        zIndex: 9999,
        backgroundColor: 'white',
        border: '1px solid #D8E1F0',
        borderRadius: 12,
        padding: '4px',
        minWidth: 180,
        boxShadow: '0 8px 32px rgba(35,72,215,0.15)',
      }}
    >
      <Item icon={BringToFront} label="Bring to Front"   onClick={() => onReorder(elementId, 'front')} />
      <Item icon={ArrowUp}      label="Bring Forward"    onClick={() => onReorder(elementId, 'forward')} />
      <Item icon={ArrowDown}    label="Send Backward"    onClick={() => onReorder(elementId, 'back')} />
      <Item icon={SendToBack}   label="Send to Back"     onClick={() => onReorder(elementId, 'back-all')} />
      <Item icon={Copy}         label="Duplicate"        onClick={() => onDuplicate(elementId)} divider />
      <Item icon={Trash2}       label="Delete"           onClick={() => onDelete(elementId)} danger divider />
    </div>
  )
}
