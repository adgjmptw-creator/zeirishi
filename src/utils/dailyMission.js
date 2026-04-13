// Daily mission engine: given the user's available study minutes, pick a
// concrete list of cards and questions to work on right now.
//
// Time budget assumptions (rough averages for commute-style study):
//   - 1 flashcard review: ~20 seconds
//   - 1 practice question: ~45 seconds
//
// Mix policy:
//   - 70% of the time on cards (reviews first, then new intros)
//   - 30% of the time on questions (weakest first, then unanswered)

const SECONDS_PER_CARD = 20
const SECONDS_PER_QUESTION = 45
const CARD_TIME_RATIO = 0.7

export function buildMission({
  dailyMinutes,
  allCards,
  cardStates,
  allQuestions,
  questionStates,
  now = Date.now(),
}) {
  const totalSeconds = dailyMinutes * 60
  const cardBudget = totalSeconds * CARD_TIME_RATIO
  const questionBudget = totalSeconds - cardBudget

  const cardSlots = Math.max(1, Math.floor(cardBudget / SECONDS_PER_CARD))
  const questionSlots = Math.max(0, Math.floor(questionBudget / SECONDS_PER_QUESTION))

  const stateByCard = new Map(cardStates.map((s) => [s.card_id, s]))
  const stateByQ = new Map(questionStates.map((s) => [s.question_id, s]))

  // Cards: due first (SM-2 next_review_at <= now), then brand new cards.
  const dueCards = []
  const newCards = []
  for (const card of allCards) {
    const state = stateByCard.get(card.id)
    if (!state) {
      newCards.push(card)
    } else if (state.next_review_at <= now) {
      dueCards.push({ ...card, _due: state.next_review_at })
    }
  }
  dueCards.sort((a, b) => a._due - b._due)
  // New intros: curriculum level first (超入門 → 基礎 → 発展), then
  // frequency rank within the same level. This is what protects a pure
  // beginner from being thrown an advanced card on day one.
  newCards.sort((a, b) => {
    const levelDiff = (a.curriculum_level ?? 3) - (b.curriculum_level ?? 3)
    if (levelDiff !== 0) return levelDiff
    return rankOrder(a.frequency_rank) - rankOrder(b.frequency_rank)
  })

  const missionCards = [...dueCards, ...newCards].slice(0, cardSlots)

  // Questions: unanswered first, then lowest accuracy among attempted.
  const unanswered = []
  const weak = []
  for (const q of allQuestions) {
    const state = stateByQ.get(q.id)
    if (!state || state.total_attempts === 0) {
      unanswered.push(q)
    } else {
      const accuracy = state.correct_attempts / state.total_attempts
      weak.push({ q, accuracy, last: state.last_answered_at ?? 0 })
    }
  }
  weak.sort((a, b) => a.accuracy - b.accuracy || a.last - b.last)
  unanswered.sort((a, b) => a.level - b.level)

  const missionQuestions = [
    ...unanswered.map((q) => q),
    ...weak.map((w) => w.q),
  ].slice(0, questionSlots)

  return {
    cards: missionCards,
    questions: missionQuestions,
    estimatedSeconds:
      missionCards.length * SECONDS_PER_CARD +
      missionQuestions.length * SECONDS_PER_QUESTION,
    cardSlots,
    questionSlots,
  }
}

function rankOrder(rank) {
  if (rank === 'A') return 0
  if (rank === 'B') return 1
  return 2
}
