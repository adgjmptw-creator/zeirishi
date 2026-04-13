import { useRef, useState } from 'react'

// Swipe-enabled flash card.
// Right = 覚えた (grade 4), Left = もう一度 (grade 2), Up = 自信あり (grade 5).
export default function FlashCard({ card, onGrade }) {
  const [flipped, setFlipped] = useState(false)
  const touchStart = useRef(null)

  const handleTouchStart = (e) => {
    const t = e.touches[0]
    touchStart.current = { x: t.clientX, y: t.clientY }
  }

  const handleTouchEnd = (e) => {
    if (!touchStart.current) return
    const t = e.changedTouches[0]
    const dx = t.clientX - touchStart.current.x
    const dy = t.clientY - touchStart.current.y
    touchStart.current = null
    const absX = Math.abs(dx)
    const absY = Math.abs(dy)
    const THRESHOLD = 40

    if (Math.max(absX, absY) < THRESHOLD) {
      setFlipped((f) => !f)
      return
    }

    if (absY > absX && dy < 0) {
      onGrade(5) // up = 自信あり
    } else if (dx > 0) {
      onGrade(4) // right = 覚えた
    } else {
      onGrade(2) // left = もう一度
    }
    setFlipped(false)
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setFlipped((f) => !f)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="w-full max-w-md min-h-[60vh] rounded-3xl bg-slate-800 border border-slate-700 shadow-2xl p-6 flex flex-col items-center justify-center text-center select-none cursor-pointer overflow-y-auto"
      >
        {flipped ? (
          <div className="w-full flex flex-col gap-4">
            <div className="text-lg leading-relaxed whitespace-pre-wrap text-left">
              {card.back}
            </div>
            {card.memory_tip && (
              <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 text-left">
                <div className="text-xs font-semibold text-amber-300 mb-1">
                  💡 覚え方・ゴロ合わせ
                </div>
                <div className="text-sm leading-relaxed whitespace-pre-wrap text-amber-100">
                  {card.memory_tip}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-xl leading-relaxed whitespace-pre-wrap">
            {card.front}
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400 text-center">
        タップで表裏を切替 / スワイプで評価
      </p>

      <div className="grid grid-cols-3 gap-3 w-full max-w-md">
        <button
          onClick={() => {
            onGrade(2)
            setFlipped(false)
          }}
          className="py-4 rounded-xl bg-rose-600 active:bg-rose-700 font-semibold"
        >
          ← もう一度
        </button>
        <button
          onClick={() => {
            onGrade(5)
            setFlipped(false)
          }}
          className="py-4 rounded-xl bg-sky-600 active:bg-sky-700 font-semibold"
        >
          ↑ 自信あり
        </button>
        <button
          onClick={() => {
            onGrade(4)
            setFlipped(false)
          }}
          className="py-4 rounded-xl bg-emerald-600 active:bg-emerald-700 font-semibold"
        >
          覚えた →
        </button>
      </div>
    </div>
  )
}
