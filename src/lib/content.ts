import goalsJson from '../content/goals.json'
import repCardsJson from '../content/repCards.json'
import specialCardsJson from '../content/specialCards.json'
import piecesJson from '../content/pieces.json'
import weekPlanJson from '../content/weekPlan.json'
import storiesJson from '../content/stories.json'
import rewardsJson from '../content/rewards.json'
import linesJson from '../content/lines.json'
import buddiesJson from '../content/buddies.json'
import resetScriptsJson from '../content/resetScripts.json'
import type {
  BuddyAnimal,
  Child,
  Chunk,
  Goal,
  Piece,
  RepCard,
  RewardSettings,
  Story,
  WeekPlan,
} from './types'

export const goals = goalsJson as Goal[]
export const repCards = repCardsJson as RepCard[]
export const specialCards = specialCardsJson as Record<'warmup' | 'concert' | 'comeback', RepCard>
export const pieces = piecesJson as Piece[]
export const defaultWeekPlan = weekPlanJson as WeekPlan

// The parent can edit the week in Grown-up settings; the saved plan replaces the default.
let activeWeekPlan: WeekPlan = defaultWeekPlan

export function getWeekPlan(): WeekPlan {
  return activeWeekPlan
}

export function setActiveWeekPlan(plan: WeekPlan | null | undefined) {
  activeWeekPlan = plan ?? defaultWeekPlan
}

export const stories = (storiesJson as Story[]).slice().sort((a, b) => a.seriesOrder - b.seriesOrder)
export const rewardSettings = rewardsJson as RewardSettings
export const lines = linesJson
export const buddies = buddiesJson as { animal: BuddyAnimal; spoken: string; defaultName: string }[]
export const resetScripts = resetScriptsJson as string[]

const allCards = [...repCards, ...Object.values(specialCards)]

export function cardById(id: string): RepCard | undefined {
  return allCards.find((c) => c.id === id)
}

export function goalById(id: string): Goal | undefined {
  return goals.find((g) => g.id === id)
}

export function chunkById(id: string | undefined): Chunk | undefined {
  return activeWeekPlan.chunks.find((c) => c.id === id)
}

/** The goal for a chunk: one from goals.json, or the parent's custom goal. */
export function goalForChunk(chunk: Chunk | undefined): Goal | undefined {
  if (!chunk) return undefined
  if (chunk.goalId === 'custom' && chunk.customGoal) return customGoal(chunk.customGoal.label, chunk.customGoal.spokenPrompt)
  return goalById(chunk.goalId)
}

export function customGoal(label: string, spokenPrompt?: string): Goal {
  const l = label.trim()
  const lower = l.toLowerCase()
  return {
    id: 'custom',
    label: l,
    iconKey: 'star',
    spokenPrompt: spokenPrompt?.trim() || `Think about your ${lower}.`,
    praiseLines: [
      `I noticed your ${lower} the whole time!`,
      `That was great ${lower}!`,
      `You really worked on your ${lower}.`,
      `Your ${lower} is getting stronger!`,
    ],
  }
}

export function pieceById(id: string) {
  return pieces.find((p) => p.id === id)
}

export function storyById(id: string) {
  return stories.find((s) => s.id === id) ?? stories[0]
}

/** Fill {child}, {buddy} and any extra {placeholders}. */
export function personalize(text: string, child: Child, extra: Record<string, string> = {}) {
  const vars: Record<string, string> = { child: child.name, buddy: child.buddyName, ...extra }
  return text.replace(/\{(\w+)\}/g, (m, k: string) => vars[k] ?? m)
}
