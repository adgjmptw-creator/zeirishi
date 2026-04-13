import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import FlashCard from '../components/FlashCard.jsx'
import { db } from '../db/dexie.js'
import { useSRS } from '../hooks/useSRS.js'
import { useStreak } from '../hooks/useStreak.js'

// Cards-only practice mode. Plays through all SM-2-due cards regardless of
// the daily mission, as a secondary entry point from the Home screen.
export default function Cards() {
  const { gradeCard } = useSRS()
  const { markStudiedToday } = useStreak()

  const [session, setSession] = useState(null)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    ;(async () => {
      const now = Date.now()
      const [allCards, states] = await Promise.all([
        db.cards.toArray(),
        db.cardState.toArray(),
      ])
      const stateMap = new Map(states.map((s) => [s.card_id, s]))
      const due = allCards.filter((c) => {
        const s = stateMap.get(c.id)
        if (!s) return true
        return s.next_review_at <= now
      })
      setSession(due)
    })()
  }, [])

  const current = useMemo(
    () => (session ? session[index] : null),
    [session, index],
  )

  if (session === null) {
    return <p className="text-slate-400">読み込み中…</p>
  }

  if (session.length === 0) {
    return (
      <div className="text-center flex flex-col gap-4 mt-10">
        <p className="text-xl">今日の復習はありません 🎉</p>
        <p className="text-sm text-slate-400">SM-2が次の復習日をスケジュール済みです。</p>
        <Link to="/" className="text-sky-400 underline">
          ホームに戻る
        </Link>
      </div>
    )
  }

  if (current === undefined) {
    return (
      <div className="text-center flex flex-col gap-4 mt-10">
        <p className="text-2xl font-bold">お疲れさまでした 🎉</p>
        <p className="text-slate-400">{session.length} 枚を復習しました</p>
        <Link to="/" className="text-sky-400 underline">
          ホームに戻る
        </Link>
      </div>
    )
  }

  const handleGrade = async (g) => {
    await gradeCard(current.id, g)
    await markStudiedToday()
    // On "もう一度" (grade < 3) requeue this card later in the session.
    if (g < 3) {
      setSession((prev) => {
        const next = [...prev]
        const insertAt = Math.min(index + 4, next.length)
        next.splice(insertAt, 0, current)
        return next
      })
    }
    setIndex((i) => i + 1)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>
          {index + 1} / {session.length}
        </span>
        <Link to="/" className="underline">
          中断
        </Link>
      </div>
      <FlashCard card={current} onGrade={handleGrade} />
    </div>
  )
}
