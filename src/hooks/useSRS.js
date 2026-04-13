import { useCallback, useEffect, useState } from 'react'
import { db } from '../db/dexie.js'
import { initialCardState, sm2 } from '../utils/sm2.js'

// Loads all cards whose next_review_at is in the past (or have no state yet).
// Returns { dueCards, loading, grade(cardId, grade), refresh }.
export function useSRS() {
  const [dueCards, setDueCards] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const now = Date.now()
    const allCards = await db.cards.toArray()
    const states = await db.cardState.toArray()
    const stateMap = new Map(states.map((s) => [s.card_id, s]))

    const due = allCards.filter((card) => {
      const s = stateMap.get(card.id)
      if (!s) return true
      return s.next_review_at <= now
    })

    setDueCards(due)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const grade = useCallback(async (cardId, gradeValue) => {
    const existing = await db.cardState.get(cardId)
    const prev = existing ?? { card_id: cardId, ...initialCardState() }
    const next = sm2(prev, gradeValue)
    await db.cardState.put({ card_id: cardId, ...next })
    await db.studyRecords.add({
      item_id: cardId,
      item_type: 'card',
      is_correct: gradeValue >= 3,
      studied_at: Date.now(),
      next_review_at: next.next_review_at,
    })
  }, [])

  return { dueCards, loading, grade, refresh }
}
