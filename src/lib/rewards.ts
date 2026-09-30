import type { Award, RewardChoice, RewardSettings, SessionState, WeekendBank } from './types'

/** Local date as YYYY-MM-DD. */
export function dayKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

/** The Monday of d's week, as YYYY-MM-DD. */
export function weekOf(d: Date): string {
  const monday = new Date(d)
  monday.setHours(12, 0, 0, 0)
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
  return dayKey(monday)
}

export function isWeekend(d: Date): boolean {
  return d.getDay() === 0 || d.getDay() === 6
}

/** The bank only holds minutes for the current week; a new week starts empty. */
export function currentBank(bank: WeekendBank | undefined, now: Date): number {
  return bank && bank.weekOf === weekOf(now) ? bank.minutes : 0
}

/**
 * The most notes a session could earn: one per planned rep, plus the
 * first-note (+1) and finish (+2) bonuses. The comeback bonus is extra.
 */
export function possibleNotes(s: SessionState): number {
  const reps = s.stops.filter((st) => st.enabled).reduce((n, st) => n + st.targetReps, 0)
  return reps + 1 + 2
}

export function earnedNotes(awards: Pick<Award, 'amount' | 'reason'>[]): number {
  return awards.filter((a) => a.amount > 0 && a.reason !== 'refund').reduce((n, a) => n + a.amount, 0)
}

/** A perfect practice earns the full prize; less earns its share, rounded to the minute. */
export function prizeMinutes(earned: number, possible: number, settings: RewardSettings): number {
  if (possible <= 0) return 0
  return Math.round(settings.fullPrizeMinutes * Math.min(1, earned / possible))
}

/**
 * On school days, screen time picked before the after-school hour is held
 * until that hour. Returns the unlock time, or null if usable now.
 */
export function heldUntil(now: Date, settings: RewardSettings): number | null {
  if (!settings.schoolDays.includes(now.getDay())) return null
  if (now.getHours() >= settings.afterSchoolHour) return null
  const unlock = new Date(now)
  unlock.setHours(settings.afterSchoolHour, 0, 0, 0)
  return unlock.getTime()
}

export interface TreasureOptions {
  /** Minutes on offer right now: today's prize, plus the weekend bank on Sat/Sun. */
  available: number
  fromBank: number
  alreadyPicked: boolean
  canPick: Record<RewardChoice['id'], boolean>
  canSave: boolean
}

/**
 * One pick a day. Show OR game uses all the minutes on offer; candy replaces
 * screen time and costs `candyCostMinutes`, with the rest saved for the weekend.
 * Saving puts today's minutes in the weekend bank (weekdays only; the bank resets Monday). On weekends the bank adds to
 * today's prize, up to the bank cap.
 */
export function treasureOptions(args: {
  todayMinutes: number
  bankMinutes: number
  now: Date
  alreadyPicked: boolean
  settings: RewardSettings
}): TreasureOptions {
  const { todayMinutes, bankMinutes, now, alreadyPicked, settings } = args
  const fromBank = isWeekend(now) ? Math.min(bankMinutes, settings.weekendBankCapMinutes) : 0
  const available = todayMinutes + fromBank
  const open = !alreadyPicked && available > 0
  return {
    available,
    fromBank,
    alreadyPicked,
    canPick: {
      show: open,
      game: open,
      candy: open && available >= settings.candyCostMinutes,
    },
    // Saving is always allowed on weekdays, even after today's pick (e.g. a second practice).
    canSave: todayMinutes > 0 && !isWeekend(now),
  }
}

/** What a pick does: screen minutes granted now, and the change to the weekend bank. */
export function applyPick(
  choice: RewardChoice['id'] | 'bank',
  opts: TreasureOptions,
  todayMinutes: number,
  settings: RewardSettings,
): { screenMinutes: number; bankDelta: number } {
  switch (choice) {
    case 'show':
    case 'game':
      return { screenMinutes: opts.available, bankDelta: opts.fromBank ? -opts.fromBank : 0 }
    case 'candy': {
      // Candy uses today's minutes first, then the bank; whatever is left is saved.
      const fromToday = Math.min(todayMinutes, settings.candyCostMinutes)
      const fromBank = settings.candyCostMinutes - fromToday
      return { screenMinutes: 0, bankDelta: todayMinutes - fromToday - fromBank }
    }
    case 'bank':
      return { screenMinutes: 0, bankDelta: todayMinutes }
  }
}
