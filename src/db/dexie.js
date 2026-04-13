import Dexie from 'dexie'

// Schema follows SPEC.md §8. Only tables needed for the card MVP are populated;
// others are declared so that later iterations can reuse the same DB version.
export const db = new Dexie('zeirishi')

db.version(1).stores({
  subjects: 'id, name, category',
  chapters: 'id, subject_id, sort_order',
  topics: 'id, chapter_id, frequency_rank',
  cards: 'id, topic_id, frequency_rank, difficulty',
  studyRecords: '++id, item_id, item_type, studied_at, next_review_at',
  cardState: 'card_id, next_review_at', // SM-2 state per card
  settings: 'key',
})
