import { useCallback, useEffect, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, getKV, loadBank, loadChild, loadCurrentSession, nextStoryIndex, saveChild, saveCurrentSession, setKV } from './db'
import { setActiveWeekPlan, stories } from './content'
import { createSession, reduce, type Action } from './session'
import type { Child, SessionState, WeekPlan } from './types'
import { setSpeechRate } from './speech'
import { currentBank } from './rewards'

export function useApp() {
  const [loaded, setLoaded] = useState(false)
  const [child, setChildState] = useState<Child | null>(null)
  const [session, setSession] = useState<SessionState | null>(null)
  const sessionRef = useRef<SessionState | null>(null)
  const queue = useRef(Promise.resolve())

  useEffect(() => {
    void (async () => {
      const [c, s, plan] = await Promise.all([loadChild(), loadCurrentSession(), getKV<WeekPlan>('weekPlan')])
      setActiveWeekPlan(plan)
      if (c) setSpeechRate(c.speechRate)
      setChildState(c ?? null)
      sessionRef.current = s ?? null
      setSession(s ?? null)
      setLoaded(true)
    })()
  }, [])

  const bank = useLiveQuery(async () => currentBank(await loadBank(), new Date()), [], 0)

  const sessionTokens = useLiveQuery(
    async () => {
      if (!session) return 0
      const rows = await db.ledger.where('sessionId').equals(session.id).toArray()
      return rows.filter((r) => r.amount > 0 && r.reason !== 'refund').reduce((n, r) => n + r.amount, 0)
    },
    [session?.id],
    0,
  )

  const setChild = useCallback(async (c: Child) => {
    setSpeechRate(c.speechRate)
    setChildState(c)
    await saveChild(c)
  }, [])

  /** Save the parent's week plan (null = back to the built-in default). Applies from the next session. */
  const saveWeekPlan = useCallback(async (plan: WeekPlan | null) => {
    setActiveWeekPlan(plan)
    await setKV('weekPlan', plan)
  }, [])

  const commit = useCallback((next: SessionState | null) => {
    sessionRef.current = next
    setSession(next)
    queue.current = queue.current.then(() => saveCurrentSession(next)).catch(console.error)
  }, [])

  const start = useCallback(async () => {
    const idx = await nextStoryIndex()
    const story = stories[idx % stories.length]
    commit(createSession(Date.now(), story.id))
  }, [commit])

  const dispatch = useCallback(
    (action: Action) => {
      const s = sessionRef.current
      if (!s) return
      const now = Date.now()
      const { state, awards } = reduce(s, action, now)
      if (awards.length) {
        void db.ledger.bulkAdd(
          awards.map((a) => ({ sessionId: s.id, amount: a.amount, reason: a.reason, timestamp: now })),
        )
      }
      if (action.type === 'end') {
        void (async () => {
          await db.sessions.put({ ...state, parentRating: action.rating })
          if (state.storyPage > 0) await setKV('nextStoryIndex', (await nextStoryIndex()) + 1)
        })()
        commit(null)
        return
      }
      commit(state)
    },
    [commit],
  )

  return { loaded, child, setChild, session, start, dispatch, bank, sessionTokens, saveWeekPlan }
}

export type AppApi = ReturnType<typeof useApp>
