import { useState, type ReactNode } from 'react'
import { ParentButton } from '../components/ui'
import { Art } from '../components/art/Art'
import { defaultWeekPlan, getWeekPlan, goals } from '../lib/content'
import type { Child, WeekPlan } from '../lib/types'
import { SetupScreen } from './SetupScreen'

type Tab = 'week' | 'buddy'

export function GrownUpScreen({ child, onSaveChild, onSaveWeek, onClose }: {
  child: Child
  onSaveChild: (c: Child) => void
  onSaveWeek: (p: WeekPlan | null) => Promise<void>
  onClose: () => void
}) {
  const [tab, setTab] = useState<Tab>('week')
  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center gap-2 border-b-2 border-ink/10 bg-white/70 px-4 py-3">
        <span className="mr-4 text-lg font-bold">Grown-up settings</span>
        {(['week', 'buddy'] as Tab[]).map((t) => (
          <ParentButton key={t} variant={tab === t ? 'primary' : 'plain'} onClick={() => setTab(t)}>
            {t === 'week' ? 'This week' : 'Buddy & voice'}
          </ParentButton>
        ))}
        <div className="flex-1" />
        <ParentButton onClick={onClose}>Close</ParentButton>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === 'week' ? (
          <WeekPlanEditor onSave={onSaveWeek} />
        ) : (
          <SetupScreen initial={child} onSave={onSaveChild} />
        )}
      </div>
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} className="grid grid-cols-[11rem_1fr] items-start gap-3 py-2">
      <span className="pt-3 font-medium">
        {label}
        {hint && <span className="block text-xs font-normal text-ink/50">{hint}</span>}
      </span>
      <div>{children}</div>
    </div>
  )
}

const input = 'min-h-12 w-full rounded-xl border-2 border-ink/20 bg-white px-3 text-base'

function WeekPlanEditor({ onSave }: { onSave: (p: WeekPlan | null) => Promise<void> }) {
  const [plan, setPlan] = useState<WeekPlan>(() => structuredClone(getWeekPlan()))
  const [saved, setSaved] = useState(false)
  const chunk = plan.chunks[0]
  const isCustom = chunk.goalId === 'custom'

  const update = (fn: (p: WeekPlan) => void) => {
    setPlan((prev) => {
      const next = structuredClone(prev)
      fn(next)
      return next
    })
    setSaved(false)
  }
  const setChunk = (patch: Partial<WeekPlan['chunks'][number]>) => update((p) => Object.assign(p.chunks[0], patch))

  const canSave = chunk.label.trim() && (!isCustom || chunk.customGoal?.label.trim())

  return (
    <div className="mx-auto max-w-3xl p-6 text-base">
      <p className="mb-4 text-sm text-ink/60">
        Set this after each lesson. Changes start with the next session. A session already in progress keeps its plan.
      </p>

      <section className="mb-6 rounded-3xl border-2 border-ink/15 bg-white/80 p-5">
        <h2 className="mb-2 text-lg font-bold">Focus chunk</h2>
        <Field label="Chunk name" hint="For you; he never reads it">
          <input aria-label="Chunk name" className={input} value={chunk.label} onChange={(e) => setChunk({ label: e.target.value })} />
        </Field>

        <Field label="Goal" hint="The one thing to notice. The buddy says it on every mission card.">
          <div className="flex flex-wrap gap-2">
            {goals.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setChunk({ goalId: g.id })}
                className={`flex min-h-12 items-center gap-2 rounded-xl border-2 px-3 ${chunk.goalId === g.id ? 'border-ink bg-sun/40 font-semibold' : 'border-ink/20 bg-white'}`}
              >
                <Art name={g.iconKey} className="h-7 w-7" />
                {g.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setChunk({ goalId: 'custom', customGoal: chunk.customGoal ?? { label: '', spokenPrompt: '' } })}
              className={`flex min-h-12 items-center gap-2 rounded-xl border-2 px-3 ${isCustom ? 'border-ink bg-sun/40 font-semibold' : 'border-ink/20 bg-white'}`}
            >
              <Art name="star" className="h-7 w-7" />
              Something else…
            </button>
          </div>
        </Field>

        {isCustom && (
          <>
            <Field label="Goal name" hint='e.g. "Curved fingers"'>
              <input
                aria-label="Goal name"
                className={input}
                value={chunk.customGoal?.label ?? ''}
                onChange={(e) => setChunk({ customGoal: { spokenPrompt: chunk.customGoal?.spokenPrompt ?? '', label: e.target.value } })}
              />
            </Field>
            <Field label="What the buddy says" hint="Short and kid-friendly. Optional.">
              <input
                aria-label="What the buddy says"
                className={input}
                placeholder={`Think about your ${(chunk.customGoal?.label || 'goal').toLowerCase()}.`}
                value={chunk.customGoal?.spokenPrompt ?? ''}
                onChange={(e) => setChunk({ customGoal: { label: chunk.customGoal?.label ?? '', spokenPrompt: e.target.value } })}
              />
            </Field>
          </>
        )}

        <Field label="Missions per chunk" hint="Nina's number is 5">
          <div className="flex items-center gap-3">
            <ParentButton onClick={() => update((p) => void (p.focusRepsPerChunk = Math.max(1, p.focusRepsPerChunk - 1)))}>−</ParentButton>
            <span className="w-8 text-center text-xl font-bold tabular-nums">{plan.focusRepsPerChunk}</span>
            <ParentButton onClick={() => update((p) => void (p.focusRepsPerChunk = Math.min(8, p.focusRepsPerChunk + 1)))}>+</ParentButton>
          </div>
        </Field>

        <Field label="Shrink sizes" hint="What each Shrink tap means">
          <div className="flex flex-col gap-2">
            {(['full', 'half', 'tiny'] as const).map((k) => (
              <div key={k} className="flex items-center gap-2">
                <span className="w-12 text-sm text-ink/60 capitalize">{k}</span>
                <input aria-label={`${k} size`} className={input} value={chunk.sizes[k]} onChange={(e) => setChunk({ sizes: { ...chunk.sizes, [k]: e.target.value } })} />
              </div>
            ))}
          </div>
        </Field>
      </section>

      <section className="mb-6 rounded-3xl border-2 border-ink/15 bg-white/80 p-5">
        <h2 className="mb-2 text-lg font-bold">Rest of the session</h2>
        <Field label="Warm-up piece" hint="Something he already owns">
          <input aria-label="Warm-up piece" className={input} value={plan.warmup.label} onChange={(e) => update((p) => void (p.warmup.label = e.target.value))} />
        </Field>
        <Field label="Concert piece">
          <input aria-label="Concert piece" className={input} value={plan.concert.label} onChange={(e) => update((p) => void (p.concert.label = e.target.value))} />
        </Field>
        <Field label="Lesson notes">
          <textarea
            aria-label="Lesson notes"
            className={`${input} min-h-24 py-2`}
            value={plan.lessonNotes}
            onChange={(e) => update((p) => void (p.lessonNotes = e.target.value))}
          />
        </Field>
      </section>

      <div className="flex items-center justify-end gap-3">
        <ParentButton
          variant="quiet"
          onClick={() => {
            setPlan(structuredClone(defaultWeekPlan))
            void onSave(null).then(() => setSaved(true))
          }}
        >
          Reset to defaults
        </ParentButton>
        {saved && <span className="text-sm text-ink/60">Saved ✓</span>}
        <ParentButton
          variant="primary"
          className={canSave ? '' : 'opacity-40'}
          onClick={() => {
            if (!canSave) return
            void onSave(plan).then(() => setSaved(true))
          }}
        >
          Save this week
        </ParentButton>
      </div>
    </div>
  )
}
