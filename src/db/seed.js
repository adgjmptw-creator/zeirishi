import { db } from './dexie.js'
import subjectsData from '../../content/subjects.json'
import bookkeepingCh01 from '../../content/cards/bookkeeping/ch01.json'
import fsCh01 from '../../content/cards/financial_statements/ch01.json'

// Bump this whenever built-in content JSON changes so reloads pick it up.
const CONTENT_VERSION = 2

const CARD_FILES = [bookkeepingCh01, fsCh01]

export async function seedContent() {
  const versionRow = await db.settings.get('content_version')
  if (versionRow && versionRow.value === CONTENT_VERSION) {
    return
  }

  await db.transaction(
    'rw',
    db.subjects,
    db.chapters,
    db.topics,
    db.cards,
    db.settings,
    async () => {
      await db.subjects.bulkPut(subjectsData)

      for (const file of CARD_FILES) {
        const { subject_id, chapter_id, chapter_title, topic_id, topic_title, cards } = file

        await db.chapters.put({
          id: chapter_id,
          subject_id,
          sort_order: 1,
          title: chapter_title,
        })

        await db.topics.put({
          id: topic_id,
          chapter_id,
          title: topic_title,
          frequency_rank: 'A',
        })

        const cardRows = cards.map((c) => ({
          id: c.id,
          topic_id,
          front: c.front,
          back: c.back,
          memory_tip: c.memory_tip ?? null,
          frequency_rank: c.frequency_rank ?? 'B',
          difficulty: c.difficulty ?? 1,
          subject_id,
        }))
        await db.cards.bulkPut(cardRows)
      }

      await db.settings.put({ key: 'content_version', value: CONTENT_VERSION })
    },
  )
}
