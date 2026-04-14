import { useCallback, useEffect, useState } from 'react'
import { db } from '../db/dexie.js'
import { currentStage } from '../utils/targets.js'
import { useExamSchedule } from './useExamSchedule.js'

// A card is considered "mastered" once SM-2 has pushed its interval past
// 7 days, i.e. the learner has gotten it right multiple times in a row.
const MASTERY_INTERVAL_DAYS = 7

export function useTargetProgress() {
  const { target, loaded: scheduleLoaded } = useExamSchedule()
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!scheduleLoaded) return
    setLoading(true)
    const [allCards, cardStates] = await Promise.all([
      db.cards.toArray(),
      db.cardState.toArray(),
    ])
    const stateMap = new Map(cardStates.map((s) => [s.card_id, s]))

    const relevant = allCards.filter(
      (c) =>
        target.subjectIds.includes(c.subject_id) &&
        (c.curriculum_level ?? 3) <= target.maxLevel,
    )

    const byLevel = {}
    for (let lvl = 1; lvl <= target.maxLevel; lvl++) {
      const levelCards = relevant.filter((c) => (c.curriculum_level ?? 3) === lvl)
      let seen = 0
      let mastered = 0
      for (const c of levelCards) {
        const s = stateMap.get(c.id)
        if (s) {
          seen++
          if ((s.interval ?? 0) >= MASTERY_INTERVAL_DAYS) mastered++
        }
      }
      byLevel[lvl] = {
        total: levelCards.length,
        seen,
        mastered,
      }
    }

    const totalCards = relevant.length
    const totalMastered = Object.values(byLevel).reduce(
      (a, b) => a + b.mastered,
      0,
    )
    const totalSeen = Object.values(byLevel).reduce((a, b) => a + b.seen, 0)

    setProgress({
      target,
      totalCards,
      totalSeen,
      totalMastered,
      percent:
        totalCards > 0 ? Math.round((totalMastered / totalCards) * 100) : 0,
      byLevel,
      stage: currentStage(target, byLevel),
    })
    setLoading(false)
  }, [target, scheduleLoaded])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { progress, loading, refresh }
}
