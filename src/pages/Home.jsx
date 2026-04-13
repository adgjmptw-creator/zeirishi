import { Link } from 'react-router-dom'
import { useMission } from '../hooks/useMission.js'
import { useStreak } from '../hooks/useStreak.js'
import { useExamSchedule } from '../hooks/useExamSchedule.js'
import { useStats } from '../hooks/useStats.js'

export default function Home() {
  const { mission, loading } = useMission()
  const { streak } = useStreak()
  const { examDate, daysRemaining, dailyMinutes } = useExamSchedule()
  const { stats } = useStats()

  const missionCardCount = mission?.cards.length ?? 0
  const missionQuestionCount = mission?.questions.length ?? 0
  const missionTotal = missionCardCount + missionQuestionCount
  const estimatedMinutes = mission
    ? Math.max(1, Math.round(mission.estimatedSeconds / 60))
    : 0

  return (
    <div className="flex flex-col gap-5">
      {/* Top row: streak + exam countdown */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-slate-800 border border-slate-700 p-4">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">
            連続学習
          </div>
          <div className="text-2xl font-bold mt-1">
            🔥 {streak}
            <span className="text-sm font-normal text-slate-400 ml-1">日</span>
          </div>
        </div>
        <div className="rounded-2xl bg-slate-800 border border-slate-700 p-4">
          <div className="text-[10px] uppercase tracking-wider text-slate-500">
            試験日まで
          </div>
          <div className="text-2xl font-bold mt-1">
            {daysRemaining === null ? (
              <Link to="/settings" className="text-sm text-sky-400 underline font-normal">
                試験日を設定
              </Link>
            ) : daysRemaining < 0 ? (
              <span className="text-slate-400">終了</span>
            ) : (
              <>
                {daysRemaining}
                <span className="text-sm font-normal text-slate-400 ml-1">日</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Today's mission: the main action */}
      <div className="rounded-3xl bg-gradient-to-br from-sky-600 to-sky-800 border border-sky-500/30 p-5 shadow-lg">
        <div className="text-[10px] uppercase tracking-wider text-sky-200">
          今日のミッション
        </div>
        {loading ? (
          <div className="mt-2 text-slate-300">読み込み中…</div>
        ) : missionTotal === 0 ? (
          <>
            <div className="text-xl font-bold mt-1">今日の分は完了済み 🎉</div>
            <p className="text-sm text-sky-100 mt-2">
              明日またお待ちしています。習慣化が最短合格への近道です。
            </p>
          </>
        ) : (
          <>
            <div className="text-2xl font-bold mt-1">
              カード {missionCardCount} 枚 + 問題 {missionQuestionCount} 問
            </div>
            <p className="text-xs text-sky-200 mt-1">
              想定 約{estimatedMinutes}分 ・ 目標 {dailyMinutes}分
            </p>
            <Link
              to="/mission"
              className="mt-4 block text-center py-4 rounded-2xl bg-white text-sky-800 font-bold text-lg active:bg-slate-100"
            >
              今すぐ始める →
            </Link>
          </>
        )}
      </div>

      {/* Stats row */}
      <div className="rounded-2xl bg-slate-800 border border-slate-700 p-4">
        <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">
          学習の進捗
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-lg font-bold">{stats.studiedToday}</div>
            <div className="text-[10px] text-slate-400">今日</div>
          </div>
          <div>
            <div className="text-lg font-bold">{stats.studiedTotal}</div>
            <div className="text-[10px] text-slate-400">累計</div>
          </div>
          <div>
            <div className="text-lg font-bold">
              {stats.masteredCards}
              <span className="text-xs font-normal text-slate-500">
                /{stats.totalCards}
              </span>
            </div>
            <div className="text-[10px] text-slate-400">習得済</div>
          </div>
        </div>
      </div>

      {/* Secondary actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/cards"
          className="rounded-2xl bg-slate-800 border border-slate-700 p-4 text-center text-sm active:bg-slate-700"
        >
          📇 カードのみ復習
        </Link>
        <Link
          to="/settings"
          className="rounded-2xl bg-slate-800 border border-slate-700 p-4 text-center text-sm active:bg-slate-700"
        >
          ⚙️ 設定
        </Link>
      </div>

      {!examDate && (
        <p className="text-center text-xs text-slate-500">
          試験日と1日の学習目標を設定すると、ミッションが自動調整されます。
        </p>
      )}
    </div>
  )
}
