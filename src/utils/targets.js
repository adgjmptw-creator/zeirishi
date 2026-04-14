// Exam milestones / targets. Each target declares which subjects and
// curriculum levels are in-scope so the daily mission and progress
// calculations can be scoped to the user's current goal.
//
// The recommended path for a zero-background learner is:
//   bookkeeping_3  (簿記3級)       → foundation
//   bookkeeping_2  (簿記2級)       → broader 商業簿記
//   tax_boki       (税理士 簿記論) → exam-level 簿記論
//   tax_zaisho     (税理士 財諸論) → exam-level 財務諸表論

export const TARGETS = {
  bookkeeping_3: {
    id: 'bookkeeping_3',
    label: '日商簿記3級',
    short: '簿記3級',
    subjectIds: ['bookkeeping'],
    maxLevel: 2,
    description:
      '簿記未経験者のスタート地点。合格率40〜50%、標準学習200〜300時間。',
    stageLabels: {
      1: '超入門',
      2: '簿記3級レベル',
    },
  },
  bookkeeping_2: {
    id: 'bookkeeping_2',
    label: '日商簿記2級',
    short: '簿記2級',
    subjectIds: ['bookkeeping'],
    maxLevel: 3,
    description:
      '3級の上位資格。商業簿記＋工業簿記。税理士試験の準備段階として強く推奨。',
    stageLabels: {
      1: '超入門',
      2: '簿記3級レベル',
      3: '簿記2級〜1級レベル',
    },
  },
  tax_boki: {
    id: 'tax_boki',
    label: '税理士試験 簿記論',
    short: '税理士 簿記論',
    subjectIds: ['bookkeeping'],
    maxLevel: 4,
    description: '税理士試験の会計科目。簿記1級相当＋試験特有の論点。',
    stageLabels: {
      1: '超入門',
      2: '簿記3級レベル',
      3: '簿記2級〜1級レベル',
      4: '税理士 応用論点',
    },
  },
  tax_zaisho: {
    id: 'tax_zaisho',
    label: '税理士試験 財務諸表論',
    short: '税理士 財諸論',
    subjectIds: ['financial_statements'],
    maxLevel: 4,
    description: '税理士試験の会計科目。理論（文章記述）と計算の両建て。',
    stageLabels: {
      1: '超入門',
      2: '財諸論 基礎',
      3: '財諸論 発展',
      4: '財諸論 応用論点',
    },
  },
}

export const DEFAULT_TARGET_ID = 'bookkeeping_3'

export function getTarget(id) {
  return TARGETS[id] ?? TARGETS[DEFAULT_TARGET_ID]
}

// Returns the user's "current stage" = the lowest level inside the
// target that still has < 80% mastery. Used to headline the Home card.
export function currentStage(target, byLevel) {
  for (let lvl = 1; lvl <= target.maxLevel; lvl++) {
    const stats = byLevel[lvl]
    if (!stats || stats.total === 0) continue
    if (stats.mastered / stats.total < 0.8) return lvl
  }
  return target.maxLevel
}
