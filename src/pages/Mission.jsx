import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FlashCard from '../components/FlashCard.jsx'
import QuizCard from '../components/QuizCard.jsx'
import { useMission } from '../hooks/useMission.js'
import { useSRS } from '../hooks/useSRS.js'
import { useStreak } from '../hooks/useStreak.js'

// Unified daily mission: plays through the planned cards, then problems, and
// reports completion back to the home screen.
export default function Mission() {
  const { mission, loading, refresh } = useMission()
  const { gradeCard, recordQuestion } = useSRS()
  const { markStudiedToday } = useStreak()
  const navigate = useNavigate()

  // Snapshot the mission at session start so later grading doesn't mutate it.
  const [session, setSession] = useState(null)
  const [index, setIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)

  useEffect(() => {
    if (!loading && mission && session === null) {
      const items = [
        ...mission.cards.map((c) => ({ kind: 'card', data: c })),
        ...mission.questions.map((q) => ({ kind: 'question', data: q })),
      ]
      setSession(items)
    }
  }, [loading, mission, session])

  const current = useMemo(() => {
    if (!session) return null
    return session[index] ?? null
  }, [session, index])

  if (loading || session === null) {
    return <p className="text-slate-400">読み込み中…</p>
  }

  if (session.length === 0) {
    return (
      <div className="text-center flex flex-col gap-4 mt-10">
        <p className="text-xl">今日のミッションは完了済み 🎉</p>
        <p className="text-sm text-slate-400">
          明日またお待ちしています。試験日まで一歩ずつ。
        </p>
        <Link to="/" className="text-sky-400 underline">
          ホームに戻る
        </Link>
      </div>
    )
  }

  if (current === null) {
    return (
      <div className="text-center flex flex-col gap-6 mt-10">
        <p className="text-4xl">🎉</p>
        <p className="text-2xl font-bold">お疲れさまでした！</p>
        <p className="text-slate-300">
          今日のミッションを完了しました。
          <br />
          カード {session.filter((s) => s.kind === 'card').length} 枚・問題{' '}
          {session.filter((s) => s.kind === 'question').length} 問
        </p>
        {session.some((s) => s.kind === 'question') && (
          <p className="text-sm text-slate-400">
            問題の正答率: {Math.round(
              (correctCount /
                Math.max(1, session.filter((s) => s.kind === 'question').length)) *
                100,
            )}
            %
          </p>
        )}
        <div className="flex gap-2 justify-center">
          <Link
            to="/"
            className="px-6 py-3 rounded-xl bg-sky-600 active:bg-sky-700 font-semibold"
          >
            ホームへ
          </Link>
        </div>
      </div>
    )
  }

  const handleCardGrade = async (grade) => {
    await gradeCard(current.data.id, grade)
    await markStudiedToday()
    setIndex((i) => i + 1)
  }

  const handleQuestionAnswer = async (isCorrect) => {
    await recordQuestion(current.data.id, isCorrect)
    await markStudiedToday()
    if (isCorrect) setCorrectCount((c) => c + 1)
  }

  const handleQuestionNext = async () => {
    setIndex((i) => i + 1)
    refresh()
  }

  const progress = (index / session.length) * 100

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>
          {index + 1} / {session.length}
          <span className="ml-2 text-slate-500">
            ({current.kind === 'card' ? '📇 カード' : '❓ 問題'})
          </span>
        </span>
        <button
          onClick={() => navigate('/')}
          className="underline"
        >
          中断
        </button>
      </div>
      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-sky-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {current.kind === 'card' ? (
        <FlashCard card={current.data} onGrade={handleCardGrade} />
      ) : (
        <QuizCard
          question={current.data}
          onAnswer={handleQuestionAnswer}
          onNext={handleQuestionNext}
        />
      )}
    </div>
  )
}
