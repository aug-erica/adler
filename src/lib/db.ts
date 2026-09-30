import Dexie, { type EntityTable } from 'dexie'
import type { Child, Claim, LedgerEntry, SessionLog, SessionState } from './types'

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

export async function balance(): Promise<number> {
  let sum = 0
  await db.ledger.each((e) => {
    sum += e.amount
  })
  return sum
}
