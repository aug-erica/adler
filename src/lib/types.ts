export type BuddyAnimal = 'fox' | 'bunny' | 'owl' | 'turtle'

export interface Child {
  name: string
  buddyName: string
  buddyAnimal: BuddyAnimal
  sessionLength: 'short' | 'standard'
  speechRate: number
}

export interface Goal {
  id: string
  label: string
  iconKey: string
  spokenPrompt: string
  praiseLines: string[]
}

export type RepCardType = 'voice' | 'audience' | 'focus' | 'role' | 'silly' | 'special'

export interface RepCard {
  id: string
  type: RepCardType
  label: string
  iconKey: string
  spokenText: string
  grownUpTurn: boolean
}

export type ChunkSize = 'full' | 'half' | 'tiny'

export interface Chunk {
  id: string
  pieceId: string
  label: string
  goalId: string
  sizes: Record<ChunkSize, string>
}

export interface Piece {
  id: string
  title: string
  bookOrder: number
  status: 'owned' | 'working' | 'preview' | 'upcoming'
}

export interface WeekPlan {
  weekOf: string
  focusRepsPerChunk: number
  warmup: { pieceId: string; label: string }
  chunks: Chunk[]
  concert: { pieceId: string; label: string }
  lessonNotes: string
}

export interface SceneItem {
  art: string
  x: number
  y: number
  s: number
  flip?: boolean
  sleepy?: boolean
  wiggle?: boolean
}

export interface Scene {
  bg: 'meadow' | 'pond' | 'night' | 'stage'
  items: SceneItem[]
}

export interface StoryPage {
  text: string
  scene: Scene
}

export interface Story {
  id: string
  seriesOrder: number
  title: string
  pages: StoryPage[]
  cliffhanger: string
}

export interface Reward {
  id: string
  label: string
  iconKey: string
  tokenCost: number
  screenMinutes: number
}

export interface RewardSettings {
  rewards: Reward[]
  dailyScreenMinutesCap: number
  schoolDays: number[]
  afterSchoolHour: number
}

// ---- Session ----

export type StopType = 'warmup' | 'focus' | 'break' | 'concert' | 'treasure'

export interface Stop {
  id: string
  type: StopType
  enabled: boolean
  targetReps: number
  repsDone: number
  chunkId?: string
  size: ChunkSize
  repCardIds: string[]
  ratings: ('goal' | 'tried')[]
}

export type Phase =
  | 'map'
  | 'choose'
  | 'card'
  | 'celebrate'
  | 'story'
  | 'break'
  | 'reset'
  | 'treasure'

export type ResetStage = 'choose' | 'breathe' | 'squeeze' | 'return' | 'welcome'

export interface ResetRecord {
  at: number
  returnedAt?: number
  finishedInstead?: boolean
}

export type EndReason = 'planned' | 'early' | 'stopped'

export interface SessionState {
  id: string
  startedAt: number
  started: boolean // first stop entered; plan is locked after this
  stops: Stop[]
  stopIndex: number
  phase: Phase
  offered: string[] | null
  currentCardId: string | null
  usedCardIds: string[]
  storyId: string
  storyPage: number // next page to show
  pendingStory: boolean // a page is earned and waiting to be shown
  firstNoteAt: number | null
  resets: ResetRecord[]
  resetStage: ResetStage | null
  resetStageAt: number | null
  endReason: EndReason | null
  finishBonusPaid: boolean
  endedAt: number | null
  lastCelebration: { amount: number; comeback: boolean } | null
}

export type AwardReason = 'rep' | 'firstNote' | 'finish' | 'comeback' | 'reward' | 'refund'

export interface Award {
  amount: number
  reason: AwardReason
}

export interface LedgerEntry {
  id?: number
  sessionId: string
  amount: number
  reason: string
  timestamp: number
}

export interface Claim {
  id?: number
  sessionId: string
  rewardId: string
  at: number
  heldUntil: number | null
  screenMinutes: number
}

export interface SessionLog extends SessionState {
  parentRating?: 'rough' | 'ok' | 'good'
}
