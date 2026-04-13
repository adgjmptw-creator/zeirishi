import { useCallback, useEffect, useState } from 'react'
import { db } from '../db/dexie.js'

// Day keys are local-date strings YYYY-MM-DD so that late-night commutes
// still count against the "day" the user thinks of.
export function todayKey(now = new Date()) {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function yesterdayKey(now = new Date()) {
  const d = new Date(now)
  d.setDate(d.getDate() - 1)
  return todayKey(d)
}

export function useStreak() {
  const [streak, setStreak] = useState(0)
  const [lastDate, setLastDate] = useState(null)
  const [loaded, setLoaded] = useState(false)

  const refresh = useCallback(async () => {
    const [countRow, dateRow] = await Promise.all([
      db.settings.get('streak_count'),
      db.settings.get('streak_last_date'),
    ])
    setStreak(countRow?.value ?? 0)
    setLastDate(dateRow?.value ?? null)
    setLoaded(true)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  // Called whenever the user completes at least one review. Increments the
  // streak if it's a new day; resets to 1 if a day was skipped.
  const markStudiedToday = useCallback(async () => {
    const today = todayKey()
    const dateRow = await db.settings.get('streak_last_date')
    const countRow = await db.settings.get('streak_count')
    const prevDate = dateRow?.value ?? null
    const prevCount = countRow?.value ?? 0

    if (prevDate === today) return // already counted

    let newCount
    if (prevDate === yesterdayKey()) {
      newCount = prevCount + 1
    } else {
      newCount = 1
    }
    await db.settings.put({ key: 'streak_count', value: newCount })
    await db.settings.put({ key: 'streak_last_date', value: today })
    setStreak(newCount)
    setLastDate(today)
  }, [])

  return { streak, lastDate, loaded, markStudiedToday, refresh }
}
