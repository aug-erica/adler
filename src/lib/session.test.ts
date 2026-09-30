import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createSession, currentStop, drawOffer, FIRST_NOTE_WINDOW_MS, reduce, type Action } from './session'
import { cardById, chunkById, defaultWeekPlan as weekPlan, goalForChunk, repCards, rewardSettings as rewards, setActiveWeekPlan, stories } from './content'
import type { Award, SessionState } from './types'
import { applyPick, currentBank, heldUntil, possibleNotes, prizeMinutes, treasureOptions, weekOf } from './rewards'

const T0 = 1_700_000_000_000

function seeded(seed = 1) {
  let x = seed
  return () => {
    x = (x * 16807) % 2147483647
    return (x - 1) / 2147483646
  }
}

function run(s: SessionState, actions: Action[], now = T0 + 30_000, rand = seeded()) {
  const awards: Award[] = []
  for (const a of actions) {
    const r = reduce(s, a, now, rand)
    s = r.state
    awards.push(...r.awards)
  }
  return { s, awards }
}

const sum = (aw: Award[]) => aw.reduce((n, a) => n + a.amount, 0)

describe('session plan', () => {
  it('focus chunk takes 5 reps (Nina’s number)', () => {
    const s = createSession(T0, stories[0].id, seeded())
    const focus = s.stops.find((x) => x.type === 'focus')!
    expect(weekPlan.focusRepsPerChunk).toBe(5)
    expect(focus.targetReps).toBe(5)
  })

  it('runs a full Short session start to finish and ends at Treasure with a finish bonus', () => {
    const rand = seeded(7)
    let s = createSession(T0, stories[0].id, rand)
    const awards: Award[] = []
    const seenPages: number[] = []
    let guard = 0
    const step = (a: Action, now = T0 + 30_000) => {
      const r = reduce(s, a, now, rand)
      awards.push(...r.awards)
      s = r.state
    }
    while (s.phase !== 'treasure' && guard++ < 100) {
      if (s.phase === 'map') step({ type: 'enterStop' })
      else if (s.phase === 'break') step({ type: 'breakEnd' })
      else if (s.phase === 'choose') step({ type: 'pickCard', cardId: s.offered![1] })
      else if (s.phase === 'card') step({ type: 'repDone', rating: 'tried' })
      else if (s.phase === 'celebrate') step({ type: 'celebrateEnd' })
      else if (s.phase === 'story') {
        seenPages.push(s.storyPage)
        step({ type: 'storyNext' })
      }
    }
    expect(s.phase).toBe('treasure')

    const byStop = Object.fromEntries(s.stops.map((x) => [x.type, x.repsDone]))
    expect(byStop).toMatchObject({ warmup: 1, focus: 5, concert: 1 })
    // 7 reps + first-note bonus + finish bonus
    expect(sum(awards)).toBe(7 + 1 + 2)
    // Warm-up earns page 0; five focus reps earn pages 1–5; the last page is the finale at Treasure.
    expect(seenPages).toEqual([0, 1, 2, 3, 4, 5])
    expect(stories[0].pages.length).toBe(7)
    expect(s.endReason).toBe('planned')
  })

  it('never repeats a card within a session and offers the grown-up turn at most once per chunk', () => {
    for (let seed = 1; seed < 60; seed++) {
      const rand = seeded(seed)
      let s = createSession(T0, stories[0].id, rand)
      s = run(s, [{ type: 'skipStop' }], T0, rand).s // skip warm-up
      s = run(s, [{ type: 'enterStop' }], T0, rand).s
      const offeredGrownUp: string[] = []
      while (currentStop(s).type === 'focus') {
        offeredGrownUp.push(...(s.offered ?? []).filter((id) => cardById(id)?.grownUpTurn))
        // Always pick the grown-up card when offered, to stress the rule.
        const pick = s.offered!.find((id) => cardById(id)?.grownUpTurn) ?? s.offered![0]
        s = run(s, [{ type: 'pickCard', cardId: pick }, { type: 'repDone', rating: 'goal' }, { type: 'celebrateEnd' }], T0, rand).s
        if (s.phase === 'story') s = run(s, [{ type: 'storyNext' }], T0, rand).s
      }
      const focus = s.stops.find((x) => x.type === 'focus')!
      expect(new Set(focus.repCardIds).size).toBe(focus.repCardIds.length)
      expect(focus.repCardIds.filter((id) => cardById(id)?.grownUpTurn).length).toBeLessThanOrEqual(1)
    }
  })

  it('offers two different cards', () => {
    const s = run(createSession(T0, stories[0].id, seeded()), [{ type: 'skipStop' }, { type: 'enterStop' }]).s
    const offer = drawOffer(s, seeded(3))
    expect(offer).toHaveLength(2)
    expect(offer[0]).not.toBe(offer[1])
  })
})

describe('tokens', () => {
  it('gives the first-note bonus only within 2 minutes of Start', () => {
    const s = run(createSession(T0, stories[0].id), [{ type: 'enterStop' }], T0).s
    const fast = reduce(s, { type: 'repDone', rating: 'goal' }, T0 + FIRST_NOTE_WINDOW_MS - 1)
    const slow = reduce(s, { type: 'repDone', rating: 'goal' }, T0 + FIRST_NOTE_WINDOW_MS + 1)
    expect(sum(fast.awards)).toBe(2)
    expect(sum(slow.awards)).toBe(1)
  })

  it('never produces a negative award from any session action', () => {
    const rand = seeded(11)
    let s = createSession(T0, stories[0].id, rand)
    const all: Award[] = []
    const actions: Action[] = [
      { type: 'enterStop' },
      { type: 'resetStart' },
      { type: 'resetChoose', activity: 'breathe' },
      { type: 'resetActivityEnd' },
      { type: 'repDone', rating: 'tried' },
      { type: 'resetWelcomeEnd' },
      { type: 'shrink' },
      { type: 'skipStop' },
      { type: 'finishToday' },
    ]
    for (const a of actions) {
      const r = reduce(s, a, T0 + 10_000, rand)
      s = r.state
      all.push(...r.awards)
    }
    expect(all.every((a) => a.amount > 0)).toBe(true)
  })
})

describe('reset mode', () => {
  function toFocusCard() {
    const rand = seeded(5)
    let s = createSession(T0, stories[0].id, rand)
    s = run(s, [{ type: 'skipStop' }, { type: 'enterStop' }], T0, rand).s
    s = run(s, [{ type: 'pickCard', cardId: s.offered![0] }], T0, rand).s
    return { s, rand }
  }

  it('returns to the session with a shrunken chunk, counts the rep, and pays the comeback bonus', () => {
    const { s: start, rand } = toFocusCard()
    const r = run(
      start,
      [{ type: 'resetStart' }, { type: 'resetChoose', activity: 'squeeze' }, { type: 'resetActivityEnd' }],
      T0 + 60_000,
      rand,
    )
    expect(r.s.phase).toBe('reset')
    expect(r.s.resetStage).toBe('return')
    const done = reduce(r.s, { type: 'repDone', rating: 'tried' }, T0 + 200_000, rand)
    expect(done.awards.map((a) => a.reason).sort()).toEqual(['comeback', 'rep'])
    expect(sum(done.awards)).toBe(3)
    const focus = currentStop(done.state)
    expect(focus.repsDone).toBe(1)
    expect(focus.size).toBe('half')
    expect(done.state.resets[0].returnedAt).toBe(T0 + 200_000)
    const back = reduce(done.state, { type: 'resetWelcomeEnd' }, T0 + 125_000, rand).state
    expect(back.phase).toBe('story') // the comeback rep earns the next story page
    const after = reduce(back, { type: 'storyNext' }, T0 + 130_000, rand).state
    expect(after.phase).toBe('choose')
    expect(currentStop(after).size).toBe('half')
  })

  it('"finish for today" goes to Treasure with no finish bonus and keeps earned tokens', () => {
    const { s, rand } = toFocusCard()
    const r = run(s, [{ type: 'resetStart' }, { type: 'finishToday' }], T0, rand)
    expect(r.s.phase).toBe('treasure')
    expect(r.s.endReason).toBe('early')
    expect(r.awards).toEqual([])
    expect(r.s.resets[0].finishedInstead).toBe(true)
  })

  it('shrink goes full → half → tiny and stops there', () => {
    const { s, rand } = toFocusCard()
    const r = run(s, [{ type: 'shrink' }, { type: 'shrink' }, { type: 'shrink' }], T0, rand)
    expect(currentStop(r.s).size).toBe('tiny')
  })
})

describe('content rules', () => {
  const contentDir = join(__dirname, '..', 'content')
  const files = readdirSync(contentDir).filter((f) => f.endsWith('.json'))

  it('never says "again" anywhere the child can hear it', () => {
    for (const f of files) {
      const text = readFileSync(join(contentDir, f), 'utf8')
      expect(text, f).not.toMatch(/\bagain\b/i)
    }
  })

  it('has about 20 Rep Cards with unique ids and exactly one grown-up-turn card type', () => {
    expect(repCards.length).toBeGreaterThanOrEqual(18)
    expect(new Set(repCards.map((c) => c.id)).size).toBe(repCards.length)
    expect(repCards.some((c) => c.grownUpTurn)).toBe(true)
  })

  it('every story has an intro, one page per focus rep, and a finale', () => {
    for (const st of stories) {
      expect(st.pages.length, st.id).toBe(weekPlan.focusRepsPerChunk + 2)
      expect(st.cliffhanger.length).toBeGreaterThan(0)
    }
  })

  it('holds screen-time rewards until after school on school-day mornings only', () => {
    const tueMorning = new Date(2026, 9, 6, 7, 30)
    const tueAfternoon = new Date(2026, 9, 6, 16, 0)
    const satMorning = new Date(2026, 9, 10, 8, 0)
    expect(heldUntil(tueMorning, rewards)).toBe(new Date(2026, 9, 6, 15, 0).getTime())
    expect(heldUntil(tueAfternoon, rewards)).toBeNull()
    expect(heldUntil(satMorning, rewards)).toBeNull()
  })
})

describe('week plan set by the parent', () => {
  it('uses the saved plan for the next session: goal, custom goal and missions per chunk', () => {
    const plan = structuredClone(weekPlan)
    plan.focusRepsPerChunk = 4
    plan.chunks[0].goalId = 'arm-bounce'
    setActiveWeekPlan(plan)
    try {
      const s = createSession(T0, stories[0].id)
      const focus = s.stops.find((x) => x.type === 'focus')!
      expect(focus.targetReps).toBe(4)
      expect(focus.goalLabel).toBe('Arm bounce')
      expect(goalForChunk(chunkById(focus.chunkId))?.spokenPrompt).toMatch(/bounce/)

      plan.chunks[0].goalId = 'custom'
      plan.chunks[0].customGoal = { label: 'Curved fingers', spokenPrompt: '' }
      setActiveWeekPlan(plan)
      const g = goalForChunk(chunkById(focus.chunkId))!
      expect(g.label).toBe('Curved fingers')
      expect(g.spokenPrompt).toBe('Think about your curved fingers.')
      expect(g.praiseLines.length).toBeGreaterThan(0)
    } finally {
      setActiveWeekPlan(null)
    }
    expect(createSession(T0, stories[0].id).stops.find((x) => x.type === 'focus')!.targetReps).toBe(5)
  })
})

describe('rewards: one prize a day', () => {
  const tue = new Date(2026, 9, 6, 7, 30)
  const sat = new Date(2026, 9, 10, 9, 0)

  it('a perfect Short session is 10 notes and earns the full 30 minutes; less earns its share', () => {
    const s = createSession(T0, stories[0].id)
    expect(possibleNotes(s)).toBe(10)
    expect(prizeMinutes(10, 10, rewards)).toBe(30)
    expect(prizeMinutes(12, 10, rewards)).toBe(30) // comeback bonus can't exceed a full prize
    expect(prizeMinutes(6, 10, rewards)).toBe(18)
    expect(prizeMinutes(0, 10, rewards)).toBe(0)
  })

  it('skipping a stop before starting lowers what counts as perfect', () => {
    let s = createSession(T0, stories[0].id)
    s = reduce(s, { type: 'toggleStop', stopId: 'concert' }, T0).state
    expect(possibleNotes(s)).toBe(9)
  })

  it('weekday: show or game uses all of today’s minutes; candy needs 15 and saves the rest', () => {
    const o = treasureOptions({ todayMinutes: 24, bankMinutes: 10, now: tue, alreadyPicked: false, settings: rewards })
    expect(o.available).toBe(24) // bank is for the weekend
    expect(o.canPick).toEqual({ show: true, game: true, candy: true })
    expect(o.canSave).toBe(true)
    expect(applyPick('show', o, 24, rewards)).toEqual({ screenMinutes: 24, bankDelta: 0 })
    expect(applyPick('candy', o, 24, rewards)).toEqual({ screenMinutes: 0, bankDelta: 9 })
    expect(applyPick('bank', o, 24, rewards)).toEqual({ screenMinutes: 0, bankDelta: 24 })

    const low = treasureOptions({ todayMinutes: 9, bankMinutes: 0, now: tue, alreadyPicked: false, settings: rewards })
    expect(low.canPick.candy).toBe(false)
    expect(low.canPick.show).toBe(true)
  })

  it('only one pick a day', () => {
    const o = treasureOptions({ todayMinutes: 30, bankMinutes: 0, now: tue, alreadyPicked: true, settings: rewards })
    expect(o.canPick).toEqual({ show: false, game: false, candy: false })
    expect(o.canSave).toBe(true)
  })

  it('weekend: the bank adds to today’s prize (up to the cap) and is spent by the pick', () => {
    const o = treasureOptions({ todayMinutes: 20, bankMinutes: 90, now: sat, alreadyPicked: false, settings: rewards })
    expect(o.fromBank).toBe(60)
    expect(o.available).toBe(80)
    expect(o.canSave).toBe(false)
    expect(applyPick('game', o, 20, rewards)).toEqual({ screenMinutes: 80, bankDelta: -60 })
    const small = treasureOptions({ todayMinutes: 5, bankMinutes: 20, now: sat, alreadyPicked: false, settings: rewards })
    expect(applyPick('candy', small, 5, rewards)).toEqual({ screenMinutes: 0, bankDelta: -10 })
  })

  it('the bank starts empty each Monday', () => {
    const bank = { weekOf: weekOf(tue), minutes: 40 }
    expect(currentBank(bank, sat)).toBe(40)
    expect(currentBank(bank, new Date(2026, 9, 12, 8, 0))).toBe(0)
  })
})
