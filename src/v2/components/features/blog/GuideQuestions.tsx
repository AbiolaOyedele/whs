import type { HelpQuestion } from '@v2/content/resources'

interface GuideQuestionsProps {
  questions: HelpQuestion[]
}

/** Common questions at the foot of a case study, each under a rule. */
export function GuideQuestions({ questions }: GuideQuestionsProps) {
  if (questions.length === 0) return null
  return (
    <section className="not-first:mt-fluid-xl" aria-labelledby="guide-questions">
      <h2 className="text-heading-sm mb-8" id="guide-questions">
        Common questions
      </h2>
      <dl className="flex flex-col gap-8">
        {questions.map((item) => (
          <div key={item.q} className="border-t border-slate-300 pt-6">
            <dt className="text-heading-xs text-balance">{item.q}</dt>
            <dd className="text-body-md mt-3">{item.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
