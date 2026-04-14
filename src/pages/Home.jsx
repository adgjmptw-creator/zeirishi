import { Link } from 'react-router-dom'
import { useMission } from '../hooks/useMission.js'
import { useStreak } from '../hooks/useStreak.js'
import { useExamSchedule } from '../hooks/useExamSchedule.js'
import { useStats } from '../hooks/useStats.js'
import { useTargetProgress } from '../hooks/useTargetProgress.js'

export default function Home() {
  const { mission, loading } = useMission()
  const { streak } = useStreak()
  const { examDate, daysRemaining, dailyMinutes, target } = useExamSchedule()
  const { stats } = useStats()
  const { progress } = useTargetProgress()

  const missionCardCount = mission?.cards.length ?? 0
  const missionQuestionCount = mission?.questions.length ?? 0
  const missionTotal = missionCardCount + missionQuestionCount
  const estimatedMinutes = mission
    ? Math.max(1, Math.round(mission.estimatedSeconds / 60))
    : 0

  const stageLabel = progress
    ? target.stageLabels[progress.stage] ?? `Level ${progress.stage}`
    : ''

  return (
    <div className="flex flex-col gap-5">
      {/* Target milestone card */}
      <div className="rounded-3xl bg-gradient-to-br from-indigo-700 to-indigo-900 border border-indigo-500/30 p-5 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="text-[10px] uppercase tracking-wider text-indigo-200">
            目標
          </div>
          <Link to="/settings" className="text-[10px] text-indigo-200 underline">
            変更
          </Link>
        </div>
        <div className="text-xl font-bold mt-1">🎯 {target.label}</div>
        {progress && (
          <>
            <div className="mt-3 text-xs text-indigo-200">
              現在のステージ:{' '}
              <span className="text-white font-semibold">
                Level {progress.stage} ({stageLabel})
              </span>
            </div>
            <div className="mt-1 text-[11px] text-indigo-200">
              習得率 {progress.percent}% ({progress.totalMastered}/
              {progress.totalCards} 枚)
            </div>
            <div className="mt-2 h-2 bg-indigo-950 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-300 transition-all"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </>
        )}
      </div>

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
              カード {missionCardCount} 枚
              {missionQuestionCount > 0 && ` + 問題 ${missionQuestionCount} 問`}
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

      {/* Level breakdown */}
      {progress && (
        <div className="rounded-2xl bg-slate-800 border border-slate-700 p-4">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-3">
            レベル別の進捗
          </div>
          <div className="flex flex-col gap-2">
            {Array.from({ length: target.maxLevel }, (_, i) => i + 1).map(
              (lvl) => {
                const stats = progress.byLevel[lvl]
                if (!stats || stats.total === 0) return null
                const percent = Math.round(
                  (stats.mastered / stats.total) * 100,
                )
                const isCurrent = progress.stage === lvl
                return (
                  <div key={lvl}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className={isCurrent ? 'text-sky-300 font-semibold' : 'text-slate-400'}>
                        {isCurrent && '▶ '}Level {lvl}・{target.stageLabels[lvl]}
                      </span>
                      <span className="text-slate-500">
                        {stats.mastered}/{stats.total} ({percent}%)
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          isCurrent ? 'bg-sky-500' : 'bg-slate-600'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                )
              },
            )}
          </div>
        </div>
      )}

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
