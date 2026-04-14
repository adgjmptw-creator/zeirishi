import { useEffect, useState } from 'react'
import { db } from '../db/dexie.js'

// SHA-256 of the agreed passphrase. Storing a hash rather than the plain
// string is not real security — anyone can read the bundled JS — but it
// keeps the literal password out of the repo and stops casual onlookers.
const PASSWORD_HASH =
  '61e0d86119ac816b4ce7147fae624c1d8fe5ec16869e25e641d2f389121604cc'
const UNLOCK_KEY = 'auth_unlocked'

async function sha256Hex(str) {
  const bytes = new TextEncoder().encode(str)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export default function Gate({ children }) {
  const [state, setState] = useState('loading') // loading | locked | unlocked
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    db.settings
      .get(UNLOCK_KEY)
      .then((row) => {
        setState(row?.value === true ? 'unlocked' : 'locked')
      })
      .catch(() => setState('locked'))
  }, [])

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-300">
        …
      </div>
    )
  }

  if (state === 'unlocked') return children

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(false)
    const hash = await sha256Hex(input)
    if (hash === PASSWORD_HASH) {
      await db.settings.put({ key: UNLOCK_KEY, value: true })
      setState('unlocked')
    } else {
      setError(true)
      setInput('')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm flex flex-col gap-4 rounded-3xl bg-slate-800 border border-slate-700 p-6 shadow-2xl"
      >
        <div className="text-center">
          <div className="text-4xl mb-2">🔒</div>
          <h1 className="text-xl font-bold">税理士試験 学習アプリ</h1>
          <p className="text-xs text-slate-400 mt-2">
            合言葉を入力してください
          </p>
        </div>
        <input
          type="password"
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            setError(false)
          }}
          placeholder="合言葉"
          autoFocus
          autoComplete="off"
          className="px-3 py-3 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-center"
        />
        {error && (
          <p className="text-xs text-rose-400 text-center">
            合言葉が違います
          </p>
        )}
        <button
          type="submit"
          className="py-3 rounded-lg bg-sky-600 active:bg-sky-700 font-semibold"
        >
          開く
        </button>
      </form>
    </div>
  )
}
