import { useEffect, useState } from 'react'
import { useApiKey } from '../hooks/useApiKey.js'
import { useExamSchedule } from '../hooks/useExamSchedule.js'
import { resetLearningState } from '../db/seed.js'
import { TARGETS } from '../utils/targets.js'

export default function Settings() {
  const { apiKey, loaded: apiLoaded, save: saveApiKey, clear: clearApiKey } = useApiKey()
  const {
    examDate,
    dailyMinutes,
    targetId,
    loaded: scheduleLoaded,
    saveExamDate,
    saveDailyMinutes,
    saveTargetId,
  } = useExamSchedule()

  const [apiValue, setApiValue] = useState('')
  const [examValue, setExamValue] = useState('')
  const [minutesValue, setMinutesValue] = useState(15)
  const [targetValue, setTargetValue] = useState('bookkeeping_3')
  const [savedApi, setSavedApi] = useState(false)
  const [savedSchedule, setSavedSchedule] = useState(false)
  const [resetDone, setResetDone] = useState(false)

  useEffect(() => {
    if (apiLoaded) setApiValue(apiKey)
  }, [apiLoaded, apiKey])

  useEffect(() => {
    if (scheduleLoaded) {
      setExamValue(examDate)
      setMinutesValue(dailyMinutes)
      setTargetValue(targetId)
    }
  }, [scheduleLoaded, examDate, dailyMinutes, targetId])

  const handleApiSubmit = async (e) => {
    e.preventDefault()
    await saveApiKey(apiValue.trim())
    setSavedApi(true)
    setTimeout(() => setSavedApi(false), 1500)
  }

  const handleScheduleSubmit = async (e) => {
    e.preventDefault()
    await saveTargetId(targetValue)
    await saveExamDate(examValue)
    await saveDailyMinutes(minutesValue)
    setSavedSchedule(true)
    setTimeout(() => setSavedSchedule(false), 1500)
  }

  const handleReset = async () => {
    if (!confirm('全ての学習記録（カードの進捗・問題の成績・ストリーク）をリセットします。よろしいですか？')) {
      return
    }
    await resetLearningState()
    setResetDone(true)
    setTimeout(() => {
      window.location.reload()
    }, 800)
  }

  const selectedTarget = TARGETS[targetValue]

  return (
    <div className="flex flex-col gap-5">
      {/* Target + exam schedule */}
      <section className="rounded-2xl bg-slate-800 border border-slate-700 p-5">
        <h2 className="text-sm text-slate-300 font-semibold mb-1">
          目標と学習計画
        </h2>
        <p className="text-xs text-slate-500 mb-3">
          まず目指す試験を選びます。簿記未経験の方は『日商簿記3級』からの
          スタートが最短です。
        </p>
        <form onSubmit={handleScheduleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-slate-400">目標試験</span>
            <select
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              className="px-3 py-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100"
            >
              {Object.values(TARGETS).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
            {selectedTarget && (
              <span className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                {selectedTarget.description}
              </span>
            )}
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-slate-400">試験日</span>
            <input
              type="date"
              value={examValue}
              onChange={(e) => setExamValue(e.target.value)}
              className="px-3 py-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-slate-400">1日の学習目標（分）</span>
            <input
              type="number"
              min={5}
              max={180}
              step={5}
              value={minutesValue}
              onChange={(e) => setMinutesValue(Number(e.target.value))}
              className="px-3 py-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100"
            />
          </label>

          <button
            type="submit"
            className="py-3 rounded-lg bg-sky-600 active:bg-sky-700 font-semibold"
          >
            保存
          </button>
          {savedSchedule && <p className="text-xs text-emerald-400">保存しました</p>}
        </form>
      </section>

      {/* API Key */}
      <section className="rounded-2xl bg-slate-800 border border-slate-700 p-5">
        <h2 className="text-sm text-slate-300 font-semibold mb-1">Claude API Key</h2>
        <p className="text-xs text-slate-500 mb-3">
          将来的なAI機能（弱点補強問題・論点深掘り）で使用します。IndexedDBに保存されます（現状平文）。
        </p>
        <form onSubmit={handleApiSubmit} className="flex flex-col gap-3">
          <input
            type="password"
            value={apiValue}
            onChange={(e) => setApiValue(e.target.value)}
            placeholder="sk-ant-..."
            className="w-full px-3 py-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100"
            autoComplete="off"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-3 rounded-lg bg-sky-600 active:bg-sky-700 font-semibold"
            >
              保存
            </button>
            <button
              type="button"
              onClick={async () => {
                await clearApiKey()
                setApiValue('')
              }}
              className="py-3 px-4 rounded-lg bg-slate-700 active:bg-slate-600"
            >
              クリア
            </button>
          </div>
          {savedApi && <p className="text-xs text-emerald-400">保存しました</p>}
        </form>
      </section>

      {/* Danger zone */}
      <section className="rounded-2xl bg-slate-800 border border-rose-700/40 p-5">
        <h2 className="text-sm text-rose-300 font-semibold mb-1">学習記録のリセット</h2>
        <p className="text-xs text-slate-500 mb-3">
          全カードの進捗・問題の成績・ストリークを消去します。コンテンツ自体は残ります。テスト用途。
        </p>
        <button
          type="button"
          onClick={handleReset}
          className="w-full py-3 rounded-lg bg-rose-700 active:bg-rose-800 font-semibold"
        >
          ⚠️ 学習記録をリセット
        </button>
        {resetDone && <p className="text-xs text-emerald-400 mt-2">リセット完了。再読み込みします…</p>}
      </section>
    </div>
  )
}
