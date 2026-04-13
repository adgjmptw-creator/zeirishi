// Minimal SM-2 spaced repetition implementation.
// See SPEC.md §4.2.2 for the target behavior.
//
// A "state" object looks like:
//   { repetitions, interval, easiness, next_review_at }
// Grades follow SM-2: 0..5 (0 = total blackout, 5 = perfect recall).
// In the UI we map swipes to grades:
//   left  (もう一度) -> 2 (incorrect)
//   right (覚えた)   -> 4 (correct)
//   up    (自信あり) -> 5 (perfect)

const MS_PER_DAY = 24 * 60 * 60 * 1000

export function initialCardState() {
  return {
    repetitions: 0,
    interval: 0,
    easiness: 2.5,
    next_review_at: Date.now(),
  }
}

export function sm2(state, grade) {
  let { repetitions, interval, easiness } = state

  if (grade < 3) {
    // Incorrect: reset to short interval.
    repetitions = 0
    interval = 1
  } else {
    if (repetitions === 0) {
      interval = 1
    } else if (repetitions === 1) {
      interval = 3
    } else {
      interval = Math.round(interval * easiness)
    }
    repetitions += 1
  }

  // Easiness factor update, clamped to the SM-2 minimum of 1.3.
  easiness = Math.max(
    1.3,
    easiness + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)),
  )

  return {
    repetitions,
    interval,
    easiness,
    next_review_at: Date.now() + interval * MS_PER_DAY,
  }
}
