import Dexie, { type EntityTable } from 'dexie'
import type { Child, Claim, LedgerEntry, SessionLog, SessionState, WeekendBank } from './types'

interface KV {
  key: string
  value: unknown
}

class PianoDB extends Dexie {
  kv!: EntityTable<KV, 'key'>
  sessions!: EntityTable<SessionLog, 'id'>
  ledger!: EntityTable<LedgerEntry, 'id'>
  claims!: EntityTable<Claim, 'id'>

  constructor() {
    super('adler-piano')
    this.version(1).stores({
      kv: 'key',
      sessions: 'id, startedAt',
      ledger: '++id, sessionId, timestamp',
      claims: '++id, sessionId, at',
    })
    // v2: one pick a day + weekend bank. Old per-item claims don't fit the new model.
    this.version(2)
      .stores({ claims: '++id, sessionId, at, day' })
      .upgrade((tx) => tx.table('claims').clear())
  }
}

export const db = new PianoDB()

export async function getKV<T>(key: string): Promise<T | undefined> {
  return (await db.kv.get(key))?.value as T | undefined
}

export async function setKV(key: string, value: unknown) {
  await db.kv.put({ key, value })
}

export const loadChild = () => getKV<Child>('child')
export const saveChild = (c: Child) => setKV('child', c)
export const loadCurrentSession = () => getKV<SessionState | null>('currentSession')
export const saveCurrentSession = (s: SessionState | null) => setKV('currentSession', s)

export async function nextStoryIndex(): Promise<number> {
  return (await getKV<number>('nextStoryIndex')) ?? 0
}

export const loadBank = () => getKV<WeekendBank>('weekendBank')
export const saveBank = (b: WeekendBank) => setKV('weekendBank', b)

/** Grown-up resets. */
export const resets = {
  async stories() {
    await setKV('nextStoryIndex', 0)
  },
  async prizes() {
    await db.claims.clear()
    await db.kv.delete('weekendBank')
  },
  async history() {
    await db.sessions.clear()
    await db.ledger.clear()
  },
  async everything() {
    await db.delete()
  },
}
