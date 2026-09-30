import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useLiveQuery } from 'dexie-react-hooks'
import { Art } from '../components/art/Art'
import { KidButton, ParentButton, ParentStrip, TokenCounter, useSpeakOnShow } from '../components/ui'
import { lines, personalize, rewardSettings, storyById } from '../lib/content'
import { db } from '../lib/db'
import { heldUntil, screenMinutesToday } from '../lib/rewards'
import { speak } from '../lib/speech'
import { playToken } from '../lib/sound'
import type { Child, Reward, SessionState } from '../lib/types'
import { StoryPageView } from './StoryScreen'

type Stage = 'finale' | 'chest' | 'bye'
type Rating = 'rough' | 'ok' | 'good'

export function TreasureScreen({ s, child, balance, sessionTokens, onEnd }: {
  s: SessionState
  child: Child
  balance: number
  sessionTokens: number
  onEnd: (rating?: Rating) => void
}) {
  const story = storyById(s.storyId)
  const [stage, setStage] = useState<Stage>('finale')
  const [rating, setRating] = useState<Rating | undefined>()

  const claims = useLiveQuery(() => db.claims.where('sessionId').equals(s.id).toArray(), [s.id], [])
  const todayClaims = useLiveQuery(
    async () => {
      const d = new Date()
      d.setHours(0, 0, 0, 0)
      return db.claims.where('at').aboveOrEqual(d.getTime()).toArray()
    },
    [],
    [],
  )
  const minutesToday = screenMinutesToday(todayClaims)

  useSpeakOnShow(stage === 'chest' ? `${lines.treasureIntro} ${lines.treasurePick}` : null, stage)

  useEffect(() => {
    if (stage !== 'bye') return
    void speak(`${personalize(story.cliffhanger, child)} ${lines.allDone}`)
  }, [stage, story, child])

  const claim = async (r: Reward) => {
    if (balance < r.tokenCost) {
      void speak(lines.treasureSaveUp)
      return
    }
    if (r.screenMinutes && minutesToday + r.screenMinutes > rewardSettings.dailyScreenMinutesCap) {
      void speak(lines.treasureCap)
      return
    }
    const now = Date.now()
    const held = r.screenMinutes ? heldUntil(new Date(now), rewardSettings) : null
    await db.transaction('rw', db.ledger, db.claims, async () => {
      await db.ledger.add({ sessionId: s.id, amount: -r.tokenCost, reason: `reward:${r.id}`, timestamp: now })
      await db.claims.add({ sessionId: s.id, rewardId: r.id, at: now, heldUntil: held, screenMinutes: r.screenMinutes })
    })
    playToken()
    void speak(held ? `${lines.treasureYay} ${lines.treasureHeld}` : lines.treasureYay)
  }

  const undoLast = async () => {
    const last = claims[claims.length - 1]
    if (!last?.id) return
    const r = rewardSettings.rewards.find((x) => x.id === last.rewardId)
    await db.transaction('rw', db.ledger, db.claims, async () => {
      await db.claims.delete(last.id!)
      if (r) await db.ledger.add({ sessionId: s.id, amount: r.tokenCost, reason: 'refund', timestamp: Date.now() })
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

  const held = claims.filter((c) => c.heldUntil && c.heldUntil > Date.now())
  const now = claims.filter((c) => !(c.heldUntil && c.heldUntil > Date.now()))

  return (
    <div className="flex h-full flex-col">
      <div className="flex min-h-0 flex-1 items-center justify-around gap-6 p-4">
        <div className="flex flex-col items-center gap-4">
          <motion.div initial={{ rotate: -6, scale: 0.8 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring', bounce: 0.6 }}>
            <Art name="chestOpen" className="h-60 w-60" />
          </motion.div>
          <TokenCounter count={balance} />
        </div>
        <div className="flex flex-col gap-4">
          {rewardSettings.rewards.map((r) => {
            const affordable = balance >= r.tokenCost
            return (
              <KidButton
                key={r.id}
                label={r.label}
                onClick={() => void claim(r)}
                className={`flex h-28 w-[min(44vw,26rem)] items-center gap-4 rounded-[2rem]! px-5 ${affordable ? 'bg-white' : 'bg-white/50 opacity-60'}`}
              >
                <Art name={r.iconKey} className="h-20 w-20 shrink-0" />
                <div className="flex flex-wrap items-center">
                  {Array.from({ length: r.tokenCost }, (_, i) => (
                    <Art key={i} name="note" className="h-8 w-8" />
                  ))}
                </div>
              </KidButton>
            )
          })}
        </div>
        <div className="flex max-w-56 flex-col items-center gap-3">
          <div className="flex flex-wrap justify-center gap-1">
            {now.map((c) => (
              <Art key={c.id} name={rewardSettings.rewards.find((r) => r.id === c.rewardId)?.iconKey ?? 'star'} className="h-14 w-14" />
            ))}
          </div>
          {held.length > 0 && (
            <div className="flex flex-col items-center rounded-3xl border-4 border-ink/30 bg-white/70 p-3">
              <Art name="house" className="h-20 w-20" />
              <div className="flex flex-wrap justify-center gap-1">
                {held.map((c) => (
                  <Art key={c.id} name={rewardSettings.rewards.find((r) => r.id === c.rewardId)?.iconKey ?? 'star'} className="h-10 w-10" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <ParentStrip>
        <div className="flex flex-col">
          <span>
            Earned today: <b>{sessionTokens}</b> · Saved total: <b>{balance}</b> · Screen time today: {minutesToday}/{rewardSettings.dailyScreenMinutesCap} min
          </span>
          {held.length > 0 && <span>Screen-time rewards are waiting for after school ({rewardSettings.afterSchoolHour}:00).</span>}
        </div>
        <div className="flex-1" />
        {claims.length > 0 && (
          <ParentButton onClick={() => void undoLast()} variant="quiet">
            Undo last pick
          </ParentButton>
        )}
        <ParentButton variant="primary" onClick={() => setStage('bye')}>
          All done
        </ParentButton>
      </ParentStrip>
    </div>
  )
}
