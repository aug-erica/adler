import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useLiveQuery } from 'dexie-react-hooks'
import { Art } from '../components/art/Art'
import { MinutePie } from '../components/MinutePie'
import { KidButton, ParentButton, ParentStrip, useSpeakOnShow } from '../components/ui'
import { lines, personalize, rewardSettings as settings, storyById } from '../lib/content'
import { db, loadBank, saveBank } from '../lib/db'
import { applyPick, currentBank, dayKey, heldUntil, possibleNotes, prizeMinutes, treasureOptions, weekOf } from '../lib/rewards'
import { speak } from '../lib/speech'
import { playBigToken, playToken } from '../lib/sound'
import type { Child, Claim, SessionState } from '../lib/types'
import { StoryPageView } from './StoryScreen'

type Stage = 'finale' | 'chest' | 'bye'
type Rating = 'rough' | 'ok' | 'good'
type PickId = Claim['rewardId']

const PICK_ICON: Record<PickId, string> = { show: 'tv', game: 'gamepad', candy: 'candy', bank: 'piggy' }
const PICK_NAME: Record<PickId, string> = { show: 'Show', game: 'iPad game', candy: 'Candy', bank: 'Saved for the weekend' }

function timeLabel(t: number) {
  return new Date(t).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export function TreasureScreen({ s, child, sessionTokens, onEnd }: {
  s: SessionState
  child: Child
  sessionTokens: number
  onEnd: (rating?: Rating) => void
}) {
  const story = storyById(s.storyId)
  const [stage, setStage] = useState<Stage>('finale')
  const [rating, setRating] = useState<Rating | undefined>()

  const now = new Date()
  const today = dayKey(now)
  const todayClaims = useLiveQuery(() => db.claims.where('day').equals(today).toArray(), [today], [] as Claim[])
  const bankRow = useLiveQuery(() => loadBank(), [], undefined)
  const bank = currentBank(bankRow, now)

  const possible = possibleNotes(s)
  const earned = Math.min(sessionTokens, possible)
  const todayMinutes = prizeMinutes(sessionTokens, possible, settings)
  const perfect = sessionTokens >= possible

  const myPick = todayClaims.find((c) => c.sessionId === s.id)
  const pickedEarlier = todayClaims.some((c) => c.sessionId !== s.id && c.rewardId !== 'bank')
  const opts = treasureOptions({ todayMinutes, bankMinutes: bank, now, alreadyPicked: pickedEarlier, settings })
  const weekendBonus = opts.fromBank > 0

  const intro = `${perfect ? lines.treasurePerfect : lines.treasureIntro} ${
    pickedEarlier ? lines.treasureAlreadyPicked : weekendBonus ? lines.treasureWeekend : lines.treasurePick
  }`
  useSpeakOnShow(stage === 'chest' && !myPick ? intro : null, stage)

  useEffect(() => {
    if (stage !== 'bye') return
    void speak(`${personalize(story.cliffhanger, child)} ${lines.allDone}`)
  }, [stage, story, child])

  const pick = async (id: PickId) => {
    if (myPick) return
    if (id === 'bank' ? !opts.canSave : !opts.canPick[id]) {
      if (id === 'candy') void speak(lines.treasureCandyNotYet)
      return
    }
    const at = Date.now()
    const { screenMinutes, bankDelta } = applyPick(id, opts, todayMinutes, settings)
    const held = screenMinutes > 0 ? heldUntil(new Date(at), settings) : null
    await db.transaction('rw', db.claims, db.kv, async () => {
      await db.claims.add({ sessionId: s.id, rewardId: id, at, day: today, heldUntil: held, screenMinutes, bankDelta })
      if (bankDelta) await saveBank({ weekOf: weekOf(new Date(at)), minutes: Math.max(0, bank + bankDelta) })
    })
    if (id === 'bank') {
      playToken()
      void speak(lines.treasureSavedForWeekend)
    } else {
      playBigToken()
      void speak(held ? `${lines.treasureYay} ${lines.treasureHeld}` : lines.treasureYay)
    }
  }

  const undo = async () => {
    if (!myPick?.id) return
    await db.transaction('rw', db.claims, db.kv, async () => {
      await db.claims.delete(myPick.id!)
      if (myPick.bankDelta) await saveBank({ weekOf: weekOf(now), minutes: Math.max(0, bank - myPick.bankDelta) })
    })
  }

  if (stage === 'finale') {
    const finale = story.pages[story.pages.length - 1]
    return (
      <div className="flex h-full flex-col">
        <div className="min-h-0 flex-1">
          <StoryPageView page={finale} child={child} pageKey={`${s.id}-finale`} nextIcon="chest" onNext={() => setStage('chest')} />
        </div>
      </div>
    )
  }

  if (stage === 'bye') {
    return (
      <div className="flex h-full flex-col">
        <div className="flex flex-1 items-center justify-center gap-10">
          <Art name="buddy" className="anim-bob h-64 w-64" />
          <Art name="goblin" className="h-48 w-48" sleepy />
        </div>
        <ParentStrip>
          <span className="mr-2">How did it go?</span>
          {(['rough', 'ok', 'good'] as Rating[]).map((r) => (
            <ParentButton key={r} onClick={() => setRating(r)} variant={rating === r ? 'primary' : 'plain'}>
              {r === 'ok' ? 'OK' : r[0].toUpperCase() + r.slice(1)}
            </ParentButton>
          ))}
          <div className="flex-1" />
          <ParentButton variant="primary" onClick={() => onEnd(rating)}>
            Close session
          </ParentButton>
        </ParentStrip>
      </div>
    )
  }

  const isHeld = !!myPick?.heldUntil && myPick.heldUntil > Date.now()

  return (
    <div className="flex h-full flex-col">
      <div className="flex min-h-0 flex-1 items-center justify-around gap-6 p-4">
        {/* Left: how full today's prize is */}
        <div className="flex flex-col items-center gap-4">
          <motion.div initial={{ rotate: -6, scale: 0.8 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring', bounce: 0.6 }}>
            <Art name="chestOpen" className="h-44 w-44" />
          </motion.div>
          <div className="flex max-w-72 flex-wrap justify-center gap-0.5 rounded-3xl border-4 border-ink/30 bg-white p-2" aria-label={`${earned} of ${possible} notes`}>
            {Array.from({ length: possible }, (_, i) => (
              <Art key={i} name="note" className={`h-8 w-8 ${i < earned ? '' : 'opacity-15 grayscale'}`} />
            ))}
          </div>
          <MinutePie minutes={todayMinutes} full={settings.fullPrizeMinutes} size={88} />
          {weekendBonus && (
            <div className="flex items-center gap-2">
              <span className="text-4xl font-extrabold text-ink/60">+</span>
              <Art name="piggy" className="h-16 w-16" />
              <MinutePie minutes={opts.fromBank} full={settings.fullPrizeMinutes} size={56} color="#f7a8c8" />
            </div>
          )}
        </div>

        {/* Right: the one pick for today, or what was picked */}
        {myPick ? (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="flex flex-col items-center gap-4 rounded-[2.5rem] border-4 border-ink bg-white p-8 shadow-[0_8px_0_#3b2f2f]"
          >
            <Art name={PICK_ICON[myPick.rewardId]} className="h-44 w-44" />
            {myPick.screenMinutes > 0 && <MinutePie minutes={myPick.screenMinutes} full={settings.fullPrizeMinutes} size={72} />}
            {myPick.rewardId === 'bank' && <MinutePie minutes={bank} full={settings.fullPrizeMinutes} size={72} color="#f7a8c8" />}
            {isHeld && (
              <div className="flex items-center gap-2 rounded-2xl bg-calm px-4 py-2">
                <Art name="house" className="h-14 w-14" />
                <Art name="sun" className="h-10 w-10" />
              </div>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {settings.choices.map((c) => {
              const ok = opts.canPick[c.id]
              return (
                <KidButton
                  key={c.id}
                  label={c.label}
                  onClick={() => void pick(c.id)}
                  className={`flex h-40 w-[min(22vw,15rem)] flex-col items-center justify-center gap-2 rounded-[2rem]! ${ok ? 'bg-white' : 'bg-white/50 opacity-40'}`}
                >
                  <Art name={c.iconKey} className="h-20 w-20" />
                  {c.kind === 'screen' && ok && <MinutePie minutes={opts.available} full={settings.fullPrizeMinutes} size={36} />}
                </KidButton>
              )
            })}
            {opts.canSave && (
              <KidButton
                label="Save for the weekend"
                onClick={() => void pick('bank')}
                className="flex h-40 w-[min(22vw,15rem)] flex-col items-center justify-center gap-2 rounded-[2rem]! bg-[#fde8f0]!"
              >
                <Art name="piggy" className="h-20 w-20" />
                <MinutePie minutes={todayMinutes} full={settings.fullPrizeMinutes} size={36} color="#f7a8c8" />
              </KidButton>
            )}
          </div>
        )}
      </div>
      <ParentStrip>
        <div className="flex min-w-0 flex-1 flex-col">
          <span>
            Notes: <b>{sessionTokens}</b> of {possible} → <b>{todayMinutes} min</b> prize (full = {settings.fullPrizeMinutes})
            {' · '}Weekend bank: <b>{bank} min</b>
            {weekendBonus && ` (${opts.fromBank} min added today)`}
          </span>
          <span>
            {myPick
              ? `Today's pick: ${PICK_NAME[myPick.rewardId]}${myPick.screenMinutes ? `, ${myPick.screenMinutes} min` : ''}${
                  myPick.rewardId === 'candy' && myPick.bankDelta > 0 ? ` (${myPick.bankDelta} min saved)` : ''
                }${isHeld ? `, unlocks after school at ${timeLabel(myPick.heldUntil!)}` : ''}`
              : pickedEarlier
                ? opts.canSave
                  ? "Today's prize was already picked, so these minutes can only be saved for the weekend."
                  : "Today's prize was already picked."
                : `One pick per day: a show OR a game, or candy instead (${settings.candyCostMinutes} min), or save it.`}
          </span>
        </div>
        {myPick && (
          <ParentButton onClick={() => void undo()} variant="quiet">
            Undo pick
          </ParentButton>
        )}
        <ParentButton variant="primary" onClick={() => setStage('bye')}>
          All done
        </ParentButton>
      </ParentStrip>
    </div>
  )
}
