import { motion } from 'framer-motion'
import { Art } from '../components/art/Art'
import { HearButton, KidButton, useSpeakOnShow } from '../components/ui'
import { cardById, chunkById, goalForChunk, lines, personalize } from '../lib/content'
import { currentStop } from '../lib/session'
import type { Child, RepCard, SessionState } from '../lib/types'

const TYPE_COLORS: Record<RepCard['type'], string> = {
  voice: 'bg-[#fde2c8]!',
  audience: 'bg-[#d9f1ff]!',
  focus: 'bg-[#e3f5d8]!',
  role: 'bg-[#ece2fb]!',
  silly: 'bg-[#fff1b8]!',
  special: 'bg-[#fff1b8]!',
}

function goalFor(s: SessionState) {
  const stop = currentStop(s)
  if (stop.type !== 'focus') return undefined
  return goalForChunk(chunkById(stop.chunkId))
}

export function ChooseScreen({ s, child, onPick }: { s: SessionState; child: Child; onPick: (id: string) => void }) {
  const cards = (s.offered ?? []).map((id) => cardById(id)!).filter(Boolean)
  const text = `${lines.pickMission} ${personalize(lines.offerTemplate, child, {
    a: personalize(cards[0]?.label ?? '', child),
    b: personalize(cards[1]?.label ?? '', child),
  })}`
  useSpeakOnShow(text, s.offered?.join())

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-4">
      <div className="flex w-full items-center justify-center gap-10">
        {cards.map((c, i) => (
          <motion.div key={c.id} initial={{ y: 40, opacity: 0, rotate: i ? 4 : -4 }} animate={{ y: 0, opacity: 1, rotate: i ? 2 : -2 }} transition={{ delay: i * 0.15 }}>
            <KidButton
              label={personalize(c.label, child)}
              onClick={() => onPick(c.id)}
              className={`flex h-[min(52vh,22rem)] w-[min(36vw,20rem)] items-center justify-center rounded-[2rem]! ${TYPE_COLORS[c.type]}`}
            >
              <Art name={c.iconKey} className="h-4/5 w-4/5" />
            </KidButton>
          </motion.div>
        ))}
      </div>
      <HearButton text={text} />
    </div>
  )
}

export function CardScreen({ s, child }: { s: SessionState; child: Child }) {
  const card = cardById(s.currentCardId ?? '')
  const goal = goalFor(s)
  const text = card
    ? `${personalize(card.spokenText, child)}${goal ? ' ' + personalize(lines.goalReminder, child, { goal: goal.spokenPrompt }) : ''}`
    : ''
  const stop = currentStop(s)
  useSpeakOnShow(text, `${s.currentCardId}-${stop.id}-${stop.repsDone}`)
  if (!card) return null

  return (
    <div className="flex h-full items-center justify-center gap-8 p-4">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`relative flex h-[min(62vh,30rem)] w-[min(56vw,34rem)] items-center justify-center rounded-[2.5rem] border-4 border-ink shadow-[0_8px_0_#3b2f2f] ${TYPE_COLORS[card.type]}`}
      >
        <Art name={card.iconKey} className="h-4/5 w-4/5" />
        {goal && (
          <div className="absolute -top-6 -right-6 flex h-28 w-28 items-center justify-center rounded-full border-4 border-ink bg-white shadow-[0_4px_0_#3b2f2f]">
            <Art name={goal.iconKey} className="h-20 w-20" />
          </div>
        )}
        <div className="absolute -bottom-8 -left-8 h-32 w-32">
          <Art name="buddy" className="h-32 w-32" />
        </div>
      </motion.div>
      <div className="flex flex-col items-center gap-4">
        <HearButton text={text} />
      </div>
    </div>
  )
}
