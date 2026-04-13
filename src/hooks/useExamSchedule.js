import { useCallback, useEffect, useState } from 'react'
import { db } from '../db/dexie.js'

const EXAM_DATE_KEY = 'exam_date'
const DAILY_MINUTES_KEY = 'daily_minutes'
const DEFAULT_MINUTES = 15

export function useExamSchedule() {
  const [examDate, setExamDateState] = useState('')
  const [dailyMinutes, setDailyMinutesState] = useState(DEFAULT_MINUTES)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    Promise.all([
      db.settings.get(EXAM_DATE_KEY),
      db.settings.get(DAILY_MINUTES_KEY),
    ]).then(([d, m]) => {
      if (d?.value) setExamDateState(d.value)
      if (m?.value) setDailyMinutesState(m.value)
      setLoaded(true)
    })
  }, [])

  const saveExamDate = useCallback(async (value) => {
    await db.settings.put({ key: EXAM_DATE_KEY, value })
    setExamDateState(value)
  }, [])

  const saveDailyMinutes = useCallback(async (value) => {
    const v = Math.max(5, Math.min(180, Number(value) || DEFAULT_MINUTES))
    await db.settings.put({ key: DAILY_MINUTES_KEY, value: v })
    setDailyMinutesState(v)
  }, [])

  // Computed: whole days remaining until exam. Negative if in the past.
  const daysRemaining = (() => {
    if (!examDate) return null
    const exam = new Date(examDate + 'T00:00:00')
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const diff = exam.getTime() - now.getTime()
    return Math.round(diff / (24 * 60 * 60 * 1000))
  })()

  return {
    examDate,
    dailyMinutes,
    daysRemaining,
    loaded,
    saveExamDate,
    saveDailyMinutes,
  }
}
