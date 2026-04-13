import { useEffect, useState } from 'react'
import { useApiKey } from '../hooks/useApiKey.js'

export default function Settings() {
  const { apiKey, loaded, save, clear } = useApiKey()
  const [value, setValue] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (loaded) setValue(apiKey)
  }, [loaded, apiKey])

  const handleSave = async (e) => {
    e.preventDefault()
    await save(value.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl bg-slate-800 border border-slate-700 p-5">
        <h2 className="text-sm text-slate-400 mb-3">Claude API Key</h2>
        <form onSubmit={handleSave} className="flex flex-col gap-3">
          <input
            type="password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
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
                await clear()
                setValue('')
              }}
              className="py-3 px-4 rounded-lg bg-slate-700 active:bg-slate-600"
            >
              クリア
            </button>
          </div>
          {saved && <p className="text-xs text-emerald-400">保存しました</p>}
        </form>
        <p className="text-xs text-slate-500 mt-3">
          ブラウザのIndexedDBに保存されます。今回のMVPでは暗号化されていません。
        </p>
      </section>

      <section className="rounded-2xl bg-slate-800 border border-slate-700 p-5 text-sm text-slate-400 space-y-2">
        <h2 className="text-slate-300 font-semibold">データ管理</h2>
        <p>エクスポート/インポートはPhase 2で実装予定です。</p>
      </section>
    </div>
  )
}
