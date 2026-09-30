import { useState } from 'react'
import { Art } from '../components/art/Art'
import { KidButton, ParentButton } from '../components/ui'
import { buddies, lines } from '../lib/content'
import { speak } from '../lib/speech'
import { unlockAudio } from '../lib/sound'
import type { BuddyAnimal, Child } from '../lib/types'

export function SetupScreen({ initial, onSave, onCancel }: { initial: Child | null; onSave: (c: Child) => void; onCancel?: () => void }) {
  const [animal, setAnimal] = useState<BuddyAnimal | null>(initial?.buddyAnimal ?? null)
  const [childName, setChildName] = useState(initial?.name ?? 'Adler')
  const [buddyName, setBuddyName] = useState(initial?.buddyName ?? '')
  const [rate, setRate] = useState(initial?.speechRate ?? 0.9)

  const pick = (a: BuddyAnimal) => {
    unlockAudio()
    setAnimal(a)
    const b = buddies.find((x) => x.animal === a)!
    if (!buddyName || buddies.some((x) => x.defaultName === buddyName)) setBuddyName(b.defaultName)
    void speak(`${b.spoken}!`)
  }

  const canSave = !!animal && childName.trim() && buddyName.trim()

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 overflow-y-auto p-6">
      <div className="flex flex-wrap items-center justify-center gap-6">
        {buddies.map((b) => (
          <KidButton
            key={b.animal}
            label={b.spoken}
            onClick={() => pick(b.animal)}
            glow={animal === b.animal}
            className={`flex h-40 w-40 items-center justify-center rounded-[2.5rem]! ${animal === b.animal ? 'bg-sun/40' : ''}`}
          >
            <Art name={b.animal} className="h-32 w-32" />
          </KidButton>
        ))}
      </div>
      <button
        type="button"
        className="text-sm text-ink/60 underline"
        onClick={() => {
          unlockAudio()
          void speak(lines.setupWelcome)
        }}
      >
        Tap to have the buddy ask him: “{lines.setupWelcome}”
      </button>

      <div className="w-full max-w-xl rounded-3xl border-2 border-ink/15 bg-white/80 p-5 text-base">
        <p className="mb-3 font-semibold">For the grown-up</p>
        <label className="mb-3 flex items-center gap-3">
          <span className="w-40">Child's name</span>
          <input className="min-h-12 flex-1 rounded-xl border-2 border-ink/20 px-3" value={childName} onChange={(e) => setChildName(e.target.value)} />
        </label>
        <label className="mb-3 flex items-center gap-3">
          <span className="w-40">Buddy's name</span>
          <input className="min-h-12 flex-1 rounded-xl border-2 border-ink/20 px-3" value={buddyName} placeholder="Ask him to name it!" onChange={(e) => setBuddyName(e.target.value)} />
        </label>
        <label className="mb-4 flex items-center gap-3">
          <span className="w-40">Voice speed</span>
          <input type="range" min={0.6} max={1.2} step={0.05} value={rate} onChange={(e) => setRate(Number(e.target.value))} className="flex-1" />
          <span className="w-10 tabular-nums">{rate.toFixed(2)}</span>
        </label>
        <div className="flex justify-end gap-3">
          {onCancel && (
            <ParentButton onClick={onCancel} variant="quiet">
              Cancel
            </ParentButton>
          )}
          <ParentButton
            variant="primary"
            onClick={() => {
              if (!canSave || !animal) return
              const c: Child = {
                name: childName.trim(),
                buddyName: buddyName.trim(),
                buddyAnimal: animal,
                sessionLength: initial?.sessionLength ?? 'short',
                speechRate: rate,
              }
              onSave(c)
              void speak(lines.setupPicked)
            }}
            className={canSave ? '' : 'opacity-40'}
          >
            Save
          </ParentButton>
        </div>
      </div>
    </div>
  )
}
