import Dexie from 'dexie'

// Schema follows SPEC.md §8. Version 2 adds questions, questionState, and
// richer studyRecords to support the daily mission engine.
export const db = new Dexie('zeirishi')

db.version(1).stores({
  subjects: 'id, name, category',
  chapters: 'id, subject_id, sort_order',
  topics: 'id, chapter_id, frequency_rank',
  cards: 'id, topic_id, frequency_rank, difficulty',
  studyRecords: '++id, item_id, item_type, studied_at, next_review_at',
  cardState: 'card_id, next_review_at',
  settings: 'key',
})

// v2 adds the problem-practice tables.
db.version(2).stores({
  subjects: 'id, name, category',
  chapters: 'id, subject_id, sort_order',
  topics: 'id, chapter_id, frequency_rank',
  cards: 'id, topic_id, frequency_rank, difficulty, subject_id',
  questions: 'id, topic_id, subject_id, level, type',
  questionState:
    'question_id, total_attempts, correct_attempts, last_answered_at',
  studyRecords: '++id, item_id, item_type, studied_at, next_review_at, studied_day',
  cardState: 'card_id, next_review_at',
  settings: 'key',
})
