import { db } from './dexie.js'
import subjectsData from '../../content/subjects.json'

// Card files - ordered from absolute-beginner intro to advanced.
import bkCh00a from '../../content/cards/bookkeeping/ch00a_intro.json'
import bkCh00b from '../../content/cards/bookkeeping/ch00b_basics.json'
import bkCh00c from '../../content/cards/bookkeeping/ch00c_daily.json'
import bkCh00d from '../../content/cards/bookkeeping/ch00d_closing.json'
import bkCh01 from '../../content/cards/bookkeeping/ch01.json'
import bkCh02 from '../../content/cards/bookkeeping/ch02.json'
import bkCh03 from '../../content/cards/bookkeeping/ch03.json'
import bkCh04 from '../../content/cards/bookkeeping/ch04.json'
import fsCh00 from '../../content/cards/financial_statements/ch00_intro.json'
import fsCh01 from '../../content/cards/financial_statements/ch01.json'
import fsCh02 from '../../content/cards/financial_statements/ch02.json'
import fsCh03 from '../../content/cards/financial_statements/ch03.json'
import fsCh04 from '../../content/cards/financial_statements/ch04.json'

// Question files
import bkQ01 from '../../content/questions/bookkeeping/ch01.json'
import bkQ02 from '../../content/questions/bookkeeping/ch02.json'
import fsQ01 from '../../content/questions/financial_statements/ch01.json'
import fsQ02 from '../../content/questions/financial_statements/ch02.json'

// Bump this whenever built-in content JSON changes so reloads pick it up.
const CONTENT_VERSION = 5

const CARD_FILES = [
  bkCh00a,
  bkCh00b,
  bkCh00c,
  bkCh00d,
  bkCh01,
  bkCh02,
  bkCh03,
  bkCh04,
  fsCh00,
  fsCh01,
  fsCh02,
  fsCh03,
  fsCh04,
]
const QUESTION_FILES = [bkQ01, bkQ02, fsQ01, fsQ02]

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
    db.questions,
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
          // curriculum_level: 1 = 超入門, 2 = 基礎, 3 = 発展, 4 = 応用
          // Cards without an explicit level default to 3 (advanced) so
          // beginner intro cards naturally come first in the mission order.
          curriculum_level: c.curriculum_level ?? 3,
          frequency_rank: c.frequency_rank ?? 'B',
          difficulty: c.difficulty ?? 1,
          subject_id,
        }))
        await db.cards.bulkPut(cardRows)
      }

      for (const file of QUESTION_FILES) {
        const { subject_id, topic_id, questions } = file
        const rows = questions.map((q) => ({
          id: q.id,
          topic_id,
          subject_id,
          level: q.level,
          type: q.type,
          question: q.question,
          choices: q.choices ?? null,
          answer: q.answer,
          explanation: q.explanation,
          related_topic: q.related_topic ?? topic_id,
        }))
        await db.questions.bulkPut(rows)
      }

      await db.settings.put({ key: 'content_version', value: CONTENT_VERSION })
    },
  )
}

// Wipe all learning state so the user can restart (used by Settings reset).
export async function resetLearningState() {
  await db.transaction(
    'rw',
    db.cardState,
    db.questionState,
    db.studyRecords,
    db.settings,
    async () => {
      await db.cardState.clear()
      await db.questionState.clear()
      await db.studyRecords.clear()
      await db.settings.delete('streak_count')
      await db.settings.delete('streak_last_date')
    },
  )
}
