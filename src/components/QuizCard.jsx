import { useState } from 'react'

// One-question quiz UI. Supports ox and choice types.
// onAnswer is invoked with (isCorrect: boolean) once the user chooses and
// taps "次へ" to proceed.
export default function QuizCard({ question, onAnswer, onNext }) {
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)

  const isCorrect = (() => {
    if (selected === null) return null
    if (question.type === 'ox') {
      return selected === question.answer
    }
    // choice: compare the leading letter (A/B/C/D)
    return selected === question.answer
  })()

  const handleSelect = (value) => {
    if (revealed) return
    setSelected(value)
    setRevealed(true)
    onAnswer(value === question.answer)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="text-[10px] uppercase tracking-wider text-slate-500">
        Level {question.level} ・ {question.type === 'ox' ? '○×問題' : '四択問題'}
      </div>
      <div className="rounded-2xl bg-slate-800 border border-slate-700 p-5 text-base leading-relaxed whitespace-pre-wrap">
        {question.question}
      </div>

      {question.type === 'ox' ? (
        <div className="grid grid-cols-2 gap-3">
          <OXButton
            label="○ 正しい"
            value={true}
            selected={selected}
            answer={question.answer}
            revealed={revealed}
            onClick={() => handleSelect(true)}
          />
          <OXButton
            label="× 誤り"
            value={false}
            selected={selected}
            answer={question.answer}
            revealed={revealed}
            onClick={() => handleSelect(false)}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {question.choices.map((choiceText) => {
            const letter = choiceText.split(':')[0].trim()
            const isSelected = selected === letter
            const isAnswer = question.answer === letter
            let cls =
              'w-full text-left px-4 py-3 rounded-xl border transition '
            if (!revealed) {
              cls +=
                isSelected
                  ? 'bg-sky-600 border-sky-500 text-white'
                  : 'bg-slate-800 border-slate-700 active:bg-slate-700'
            } else if (isAnswer) {
              cls += 'bg-emerald-700/40 border-emerald-500 text-emerald-100'
            } else if (isSelected) {
              cls += 'bg-rose-700/40 border-rose-500 text-rose-100'
            } else {
              cls += 'bg-slate-800 border-slate-700 text-slate-400'
            }
            return (
              <button
                key={letter}
                onClick={() => handleSelect(letter)}
                disabled={revealed}
                className={cls}
              >
                {choiceText}
              </button>
            )
          })}
        </div>
      )}

      {revealed && (
        <div className="rounded-2xl border p-4 text-sm leading-relaxed"
          style={{
            borderColor: isCorrect ? 'rgb(16 185 129 / 0.5)' : 'rgb(244 63 94 / 0.5)',
            backgroundColor: isCorrect ? 'rgb(16 185 129 / 0.1)' : 'rgb(244 63 94 / 0.1)',
          }}
        >
          <div className={`text-xs font-bold mb-2 ${isCorrect ? 'text-emerald-300' : 'text-rose-300'}`}>
            {isCorrect ? '✓ 正解' : '✗ 不正解'}
          </div>
          <p className="whitespace-pre-wrap">{question.explanation}</p>
          <button
            onClick={onNext}
            className="mt-4 w-full py-3 rounded-xl bg-sky-600 active:bg-sky-700 font-semibold"
          >
            次へ →
          </button>
        </div>
      )}
    </div>
  )
}

function OXButton({ label, value, selected, answer, revealed, onClick }) {
  const isSelected = selected === value
  const isAnswer = answer === value
  let cls = 'py-5 rounded-2xl text-lg font-bold border transition '
  if (!revealed) {
    cls += isSelected
      ? 'bg-sky-600 border-sky-500 text-white'
      : 'bg-slate-800 border-slate-700 active:bg-slate-700'
  } else if (isAnswer) {
    cls += 'bg-emerald-700/40 border-emerald-500 text-emerald-100'
  } else if (isSelected) {
    cls += 'bg-rose-700/40 border-rose-500 text-rose-100'
  } else {
    cls += 'bg-slate-800 border-slate-700 text-slate-400'
  }
  return (
    <button onClick={onClick} disabled={revealed} className={cls}>
      {label}
    </button>
  )
}
