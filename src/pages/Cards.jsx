import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import FlashCard from '../components/FlashCard.jsx'
import { useSRS } from '../hooks/useSRS.js'

export default function Cards() {
  const { dueCards, loading, grade, refresh } = useSRS()
  const [sessionCards, setSessionCards] = useState(null)
  const [index, setIndex] = useState(0)

  // Snapshot the due list when the session starts so new grading doesn't
  // reshuffle the deck mid-session.
  useEffect(() => {
    if (!loading && sessionCards === null) {
      setSessionCards(dueCards)
    }
  }, [loading, dueCards, sessionCards])

  const current = useMemo(
    () => (sessionCards ? sessionCards[index] : null),
    [sessionCards, index],
  )

  if (loading || sessionCards === null) {
    return <p className="text-slate-400">読み込み中…</p>
  }

  if (sessionCards.length === 0) {
    return (
      <div className="text-center flex flex-col gap-4 mt-10">
        <p className="text-xl">今日の復習はありません 🎉</p>
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
        <p className="text-slate-400">{sessionCards.length} 枚を復習しました</p>
        <Link to="/" className="text-sky-400 underline">
          ホームに戻る
        </Link>
      </div>
    )
  }

  const handleGrade = async (g) => {
    await grade(current.id, g)
    setIndex((i) => i + 1)
    // Refresh in the background so the Home counter stays fresh, but don't
    // mutate the current session.
    refresh()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>
          {index + 1} / {sessionCards.length}
        </span>
        <Link to="/" className="underline">
          中断
        </Link>
      </div>
      <FlashCard card={current} onGrade={handleGrade} />
    </div>
  )
}
