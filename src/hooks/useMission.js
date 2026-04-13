import { useCallback, useEffect, useState } from 'react'
import { db } from '../db/dexie.js'
import { buildMission } from '../utils/dailyMission.js'
import { useExamSchedule } from './useExamSchedule.js'

export function useMission() {
  const { dailyMinutes, loaded: scheduleLoaded } = useExamSchedule()
  const [mission, setMission] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!scheduleLoaded) return
    setLoading(true)
    const [allCards, cardStates, allQuestions, questionStates] = await Promise.all([
      db.cards.toArray(),
      db.cardState.toArray(),
      db.questions.toArray(),
      db.questionState.toArray(),
    ])
    const m = buildMission({
      dailyMinutes,
      allCards,
      cardStates,
      allQuestions,
      questionStates,
    })
    setMission(m)
    setLoading(false)
  }, [dailyMinutes, scheduleLoaded])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { mission, loading, refresh }
}
