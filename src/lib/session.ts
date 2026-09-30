import { chunkById, getWeekPlan, goalForChunk, repCards, storyById } from './content'
import type { Award, ChunkSize, SessionState, Stop } from './types'

export const FIRST_NOTE_WINDOW_MS = 2 * 60 * 1000
export const BONUS = { firstNote: 1, finish: 2, comeback: 2 } as const

const SHRINK: Record<ChunkSize, ChunkSize> = { full: 'half', half: 'tiny', tiny: 'tiny' }

/** Build today's Short session: warm-up → focus chunk → wiggle break → concert → treasure. */
export function createSession(now: number, storyId: string, rand = Math.random): SessionState {
  const plan = getWeekPlan()
  const chunk = plan.chunks[0]
  const stop = (type: Stop['type'], targetReps: number, chunkId?: string): Stop => ({
    id: type,
    type,
    enabled: true,
    targetReps,
    repsDone: 0,
    chunkId,
    ...(chunkId ? { chunkLabel: chunk?.label, goalLabel: goalForChunk(chunk)?.label } : {}),
    size: 'full',
    repCardIds: [],
    ratings: [],
  })
  const state: SessionState = {
    id: `s-${now}-${Math.floor(rand() * 1e6)}`,
    startedAt: now,
    started: false,
    stops: [
      stop('warmup', 1),
      stop('focus', plan.focusRepsPerChunk, chunk?.id),
      stop('break', 0),
      stop('concert', 1),
      stop('treasure', 0),
    ],
    stopIndex: 0,
    phase: 'map',
    offered: null,
    currentCardId: null,
    usedCardIds: [],
    storyId,
    storyPage: 0,
    pendingStory: false,
    firstNoteAt: null,
    resets: [],
    resetStage: null,
    resetStageAt: null,
    endReason: null,
    finishBonusPaid: false,
    endedAt: null,
    lastCelebration: null,
  }
  return state
}

export function currentStop(s: SessionState): Stop {
  return s.stops[s.stopIndex]
}

export function isRepStop(stop: Stop) {
  return stop.type === 'warmup' || stop.type === 'focus' || stop.type === 'concert'
}

/**
 * Draw two cards for the child to pick from: no repeats inside a session,
 * and the grown-up-turn card at most once per chunk.
 */
export function drawOffer(s: SessionState, rand = Math.random): string[] {
  const stop = currentStop(s)
  const grownUpUsed = stop.repCardIds.some((id) => repCards.find((c) => c.id === id)?.grownUpTurn)
  let pool = repCards.filter((c) => !s.usedCardIds.includes(c.id) && !(grownUpUsed && c.grownUpTurn))
  if (pool.length < 2) {
    // Deck exhausted (very long session): reshuffle everything except this chunk's cards.
    pool = repCards.filter((c) => !stop.repCardIds.includes(c.id) && !(grownUpUsed && c.grownUpTurn))
  }
  const picks: string[] = []
  const copy = pool.slice()
  // Prefer two cards of different types so the choice feels real.
  while (picks.length < 2 && copy.length) {
    const i = Math.floor(rand() * copy.length)
    const [card] = copy.splice(i, 1)
    const first = repCards.find((c) => c.id === picks[0])
    if (picks.length === 1 && first && first.type === card.type && copy.some((c) => c.type !== first.type)) {
      continue
    }
    picks.push(card.id)
  }
  return picks
}

function firstEnabledFrom(s: SessionState, index: number): number {
  let i = index
  while (i < s.stops.length - 1 && !s.stops[i].enabled) i++
  return i
}

/** Story pages: page 0 after the warm-up, one page per focus rep, the last page is the finale at Treasure. */
function earnsStoryPage(s: SessionState): boolean {
  const stop = currentStop(s)
  const story = storyById(s.storyId)
  const finaleIndex = story.pages.length - 1
  if (s.storyPage >= finaleIndex) return false
  return stop.type === 'warmup' || stop.type === 'focus'
}

export type Action =
  | { type: 'toggleStop'; stopId: string }
  | { type: 'enterStop' }
  | { type: 'pickCard'; cardId: string }
  | { type: 'repDone'; rating: 'goal' | 'tried' }
  | { type: 'celebrateEnd' }
  | { type: 'storyNext' }
  | { type: 'breakEnd' }
  | { type: 'shrink' }
  | { type: 'skipStop' }
  | { type: 'resetStart' }
  | { type: 'resetChoose'; activity: 'breathe' | 'squeeze' }
  | { type: 'resetActivityEnd' }
  | { type: 'resetWelcomeEnd' }
  | { type: 'finishToday' }
  | { type: 'end'; rating?: 'rough' | 'ok' | 'good' }

export interface Result {
  state: SessionState
  awards: Award[]
}

function advanceToNextStop(s: SessionState): SessionState {
  const next = firstEnabledFrom(s, s.stopIndex + 1)
  return { ...s, stopIndex: next, phase: 'map', offered: null, currentCardId: null, pendingStory: false }
}

function goToTreasure(s: SessionState, reason: 'planned' | 'early', awards: Award[]): SessionState {
  const treasureIndex = s.stops.findIndex((st) => st.type === 'treasure')
  let next: SessionState = {
    ...s,
    stopIndex: treasureIndex,
    phase: 'treasure',
    offered: null,
    currentCardId: null,
    pendingStory: false,
    resetStage: null,
    resetStageAt: null,
    endReason: s.endReason ?? reason,
  }
  if (reason === 'planned' && !s.finishBonusPaid) {
    awards.push({ amount: BONUS.finish, reason: 'finish' })
    next = { ...next, finishBonusPaid: true }
  }
  return next
}

/** After a rep's celebration (and story page, if any): the next card, or the next stop. */
function afterRep(s: SessionState, rand: () => number): SessionState {
  const stop = currentStop(s)
  if (stop.repsDone >= stop.targetReps) return advanceToNextStop(s)
  if (stop.type === 'focus') return { ...s, phase: 'choose', offered: drawOffer(s, rand), currentCardId: null }
  return { ...s, phase: 'card', currentCardId: stop.type === 'warmup' ? 'warmup' : 'concert' }
}

function withStop(s: SessionState, patch: Partial<Stop>): SessionState {
  const stops = s.stops.map((st, i) => (i === s.stopIndex ? { ...st, ...patch } : st))
  return { ...s, stops }
}

export function reduce(s: SessionState, action: Action, now: number, rand = Math.random): Result {
  const awards: Award[] = []
  const stop = currentStop(s)

  switch (action.type) {
    case 'toggleStop': {
      if (s.started) return { state: s, awards }
      const stops = s.stops.map((st) =>
        st.id === action.stopId && st.type !== 'treasure' ? { ...st, enabled: !st.enabled } : st,
      )
      const next = { ...s, stops }
      return { state: { ...next, stopIndex: firstEnabledFrom(next, 0) }, awards }
    }

    case 'enterStop': {
      if (s.phase !== 'map') return { state: s, awards }
      const base = { ...s, started: true }
      switch (stop.type) {
        case 'warmup':
          return { state: { ...base, phase: 'card', currentCardId: 'warmup' }, awards }
        case 'concert':
          return { state: { ...base, phase: 'card', currentCardId: 'concert' }, awards }
        case 'focus':
          return { state: { ...base, phase: 'choose', offered: drawOffer(base, rand) }, awards }
        case 'break':
          return { state: { ...base, phase: 'break' }, awards }
        case 'treasure':
          return { state: goToTreasure(base, 'planned', awards), awards }
      }
      return { state: s, awards }
    }

    case 'pickCard': {
      if (s.phase !== 'choose' || !s.offered?.includes(action.cardId)) return { state: s, awards }
      return { state: { ...s, phase: 'card', currentCardId: action.cardId, offered: null }, awards }
    }

    case 'repDone': {
      const inReturn = s.phase === 'reset' && s.resetStage === 'return'
      if (s.phase !== 'card' && !inReturn) return { state: s, awards }
      awards.push({ amount: 1, reason: 'rep' })
      let next: SessionState = s
      if (s.firstNoteAt === null) {
        next = { ...next, firstNoteAt: now }
        if (now - s.startedAt <= FIRST_NOTE_WINDOW_MS) awards.push({ amount: BONUS.firstNote, reason: 'firstNote' })
      }
      const cardId = inReturn ? 'comeback' : s.currentCardId
      const cardIsDeckCard = !!cardId && repCards.some((c) => c.id === cardId)
      next = withStop(next, {
        repsDone: isRepStop(stop) ? stop.repsDone + 1 : stop.repsDone,
        repCardIds: cardId ? [...stop.repCardIds, cardId] : stop.repCardIds,
        ratings: [...stop.ratings, action.rating],
      })
      if (cardIsDeckCard && cardId) next = { ...next, usedCardIds: [...next.usedCardIds, cardId] }

      if (inReturn) {
        awards.push({ amount: BONUS.comeback, reason: 'comeback' })
        const resets = next.resets.slice()
        const last = resets[resets.length - 1]
        if (last && !last.returnedAt) resets[resets.length - 1] = { ...last, returnedAt: now }
        next = { ...next, resets, resetStage: 'welcome', resetStageAt: now }
        // The session resumes at a smaller chunk.
        if (stop.type === 'focus') next = withStop(next, { size: SHRINK[stop.size] })
      } else {
        next = { ...next, phase: 'celebrate' }
      }
      const earned = awards.reduce((n, a) => n + a.amount, 0)
      next = {
        ...next,
        pendingStory: isRepStop(stop) && earnsStoryPage(next),
        lastCelebration: { amount: earned, comeback: inReturn },
      }
      return { state: next, awards }
    }

    case 'resetWelcomeEnd': {
      if (s.phase !== 'reset' || s.resetStage !== 'welcome') return { state: s, awards }
      // The welcome-back screen is the celebration; go straight on to the story page or next mission.
      const back: SessionState = { ...s, resetStage: null, resetStageAt: null }
      if (s.pendingStory) return { state: { ...back, phase: 'story' }, awards }
      return { state: afterRep(back, rand), awards }
    }

    case 'celebrateEnd': {
      if (s.phase !== 'celebrate') return { state: s, awards }
      if (s.pendingStory) return { state: { ...s, phase: 'story' }, awards }
      return { state: afterRep(s, rand), awards }
    }

    case 'storyNext': {
      if (s.phase !== 'story') return { state: s, awards }
      const next = { ...s, storyPage: s.storyPage + 1, pendingStory: false }
      return { state: afterRep(next, rand), awards }
    }

    case 'breakEnd': {
      if (s.phase !== 'break') return { state: s, awards }
      return { state: advanceToNextStop(s), awards }
    }

    case 'shrink': {
      if (stop.type !== 'focus') return { state: s, awards }
      return { state: withStop(s, { size: SHRINK[stop.size] }), awards }
    }

    case 'skipStop': {
      if (stop.type === 'treasure') return { state: s, awards }
      if (s.phase === 'reset') return { state: s, awards }
      const next = advanceToNextStop({ ...s, started: true })
      return { state: next, awards }
    }

    case 'resetStart': {
      if (s.phase === 'reset' || s.phase === 'treasure') return { state: s, awards }
      return {
        state: {
          ...s,
          started: true,
          phase: 'reset',
          resetStage: 'choose',
          resetStageAt: now,
          offered: null,
          currentCardId: null,
          pendingStory: false,
          resets: [...s.resets, { at: now }],
        },
        awards,
      }
    }

    case 'resetChoose': {
      if (s.phase !== 'reset' || s.resetStage !== 'choose') return { state: s, awards }
      return { state: { ...s, resetStage: action.activity, resetStageAt: now }, awards }
    }

    case 'resetActivityEnd': {
      if (s.phase !== 'reset' || (s.resetStage !== 'breathe' && s.resetStage !== 'squeeze' && s.resetStage !== 'choose')) {
        return { state: s, awards }
      }
      return { state: { ...s, resetStage: 'return', resetStageAt: now }, awards }
    }

    case 'finishToday': {
      if (s.phase === 'treasure') return { state: s, awards }
      let next = s
      if (s.phase === 'reset') {
        const resets = s.resets.slice()
        const last = resets[resets.length - 1]
        if (last && !last.returnedAt) resets[resets.length - 1] = { ...last, finishedInstead: true }
        next = { ...s, resets }
      }
      return { state: goToTreasure({ ...next, started: true }, 'early', awards), awards }
    }

    case 'end': {
      return { state: { ...s, endedAt: now, endReason: s.endReason ?? 'stopped' }, awards }
    }
  }
}

export function repsLabel(stop: Stop) {
  return `Rep ${Math.min(stop.repsDone + 1, stop.targetReps)} of ${stop.targetReps}`
}

export function chunkSizeLabel(stop: Stop) {
  const chunk = chunkById(stop.chunkId)
  return chunk ? chunk.sizes[stop.size] : ''
}
