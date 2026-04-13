import { useCallback, useEffect, useState } from 'react'
import { db } from '../db/dexie.js'

const KEY = 'claude_api_key'

export function useApiKey() {
  const [apiKey, setApiKeyState] = useState('')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    db.settings.get(KEY).then((row) => {
      if (row?.value) setApiKeyState(row.value)
      setLoaded(true)
    })
  }, [])

  const save = useCallback(async (value) => {
    // NOTE: stored in plaintext for MVP. Encrypt at rest in a later iteration.
    await db.settings.put({ key: KEY, value })
    setApiKeyState(value)
  }, [])

  const clear = useCallback(async () => {
    await db.settings.delete(KEY)
    setApiKeyState('')
  }, [])

  return { apiKey, loaded, save, clear }
}
