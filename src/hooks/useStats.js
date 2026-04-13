import { useCallback, useEffect, useState } from 'react'
import { db } from '../db/dexie.js'
import { todayKey } from './useStreak.js'

// Aggregates simple learning statistics for the Home / Dashboard.
export function useStats() {
  const [stats, setStats] = useState({
    studiedToday: 0,
    studiedTotal: 0,
    masteredCards: 0,
    totalCards: 0,
    questionAccuracy: null,
  })
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const today = todayKey()
    const [records, cardStates, totalCards, questionStates] = await Promise.all([
      db.studyRecords.toArray(),
      db.cardState.toArray(),
      db.cards.count(),
      db.questionState.toArray(),
    ])

    const studiedToday = records.filter((r) => r.studied_day === today).length

    // A card is considered "mastered" once SM-2 has pushed its interval out
    // past 14 days. This is a heuristic, not a hard contract.
    const masteredCards = cardStates.filter((s) => (s.interval ?? 0) >= 14).length

    let totalAttempts = 0
    let totalCorrect = 0
    for (const q of questionStates) {
      totalAttempts += q.total_attempts ?? 0
      totalCorrect += q.correct_attempts ?? 0
    }
    const questionAccuracy =
      totalAttempts > 0 ? totalCorrect / totalAttempts : null

    setStats({
      studiedToday,
      studiedTotal: records.length,
      masteredCards,
      totalCards,
      questionAccuracy,
    })
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { stats, loading, refresh }
}
