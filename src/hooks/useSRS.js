import { useCallback } from 'react'
import { db } from '../db/dexie.js'
import { initialCardState, sm2 } from '../utils/sm2.js'
import { todayKey } from './useStreak.js'

// Thin helper for grading a single card. The Mission page owns the session
// list, so this hook no longer loads cards itself.
export function useSRS() {
  const gradeCard = useCallback(async (cardId, gradeValue) => {
    const existing = await db.cardState.get(cardId)
    const prev = existing ?? { card_id: cardId, ...initialCardState() }
    const next = sm2(prev, gradeValue)
    await db.cardState.put({ card_id: cardId, ...next })
    await db.studyRecords.add({
      item_id: cardId,
      item_type: 'card',
      is_correct: gradeValue >= 3,
      studied_at: Date.now(),
      studied_day: todayKey(),
      next_review_at: next.next_review_at,
    })
  }, [])

  const recordQuestion = useCallback(async (questionId, isCorrect) => {
    const existing = await db.questionState.get(questionId)
    const prev = existing ?? {
      question_id: questionId,
      total_attempts: 0,
      correct_attempts: 0,
      last_answered_at: 0,
    }
    await db.questionState.put({
      question_id: questionId,
      total_attempts: prev.total_attempts + 1,
      correct_attempts: prev.correct_attempts + (isCorrect ? 1 : 0),
      last_answered_at: Date.now(),
    })
    await db.studyRecords.add({
      item_id: questionId,
      item_type: 'question',
      is_correct: isCorrect,
      studied_at: Date.now(),
      studied_day: todayKey(),
      next_review_at: Date.now(),
    })
  }, [])

  return { gradeCard, recordQuestion }
}
