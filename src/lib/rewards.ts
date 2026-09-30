import type { Claim, RewardSettings } from './types'

/**
 * On school days, screen-time rewards earned before the after-school hour are
 * held until that hour. Returns the unlock time, or null if usable now.
 */
export function heldUntil(now: Date, settings: RewardSettings): number | null {
  if (!settings.schoolDays.includes(now.getDay())) return null
  if (now.getHours() >= settings.afterSchoolHour) return null
  const unlock = new Date(now)
  unlock.setHours(settings.afterSchoolHour, 0, 0, 0)
  return unlock.getTime()
}

export function screenMinutesToday(claims: Pick<Claim, 'screenMinutes'>[]): number {
  return claims.reduce((n, c) => n + c.screenMinutes, 0)
}
