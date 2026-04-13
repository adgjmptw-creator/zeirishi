import { Link } from 'react-router-dom'
import { useSRS } from '../hooks/useSRS.js'

export default function Home() {
  const { dueCards, loading } = useSRS()

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl bg-slate-800 border border-slate-700 p-5">
        <h2 className="text-sm text-slate-400 mb-2">今日のミッション</h2>
        <p className="text-3xl font-bold">
          {loading ? '…' : `暗記カード ${dueCards.length} 枚`}
        </p>
        <p className="text-xs text-slate-500 mt-1">※ ストリークはPhase 2で実装予定</p>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/cards"
          className="rounded-2xl bg-sky-600 active:bg-sky-700 p-5 text-center font-semibold"
        >
          暗記カード
        </Link>
        <button
          disabled
          className="rounded-2xl bg-slate-700 p-5 text-center font-semibold text-slate-400"
        >
          問題演習
          <span className="block text-[10px] font-normal">近日対応</span>
        </button>
        <button
          disabled
          className="rounded-2xl bg-slate-700 p-5 text-center font-semibold text-slate-400"
        >
          過去問
          <span className="block text-[10px] font-normal">近日対応</span>
        </button>
        <button
          disabled
          className="rounded-2xl bg-slate-700 p-5 text-center font-semibold text-slate-400"
        >
          ダッシュボード
          <span className="block text-[10px] font-normal">近日対応</span>
        </button>
      </div>

      <Link
        to="/settings"
        className="text-center text-sm text-slate-400 underline"
      >
        Claude API Key を設定
      </Link>
    </div>
  )
}
