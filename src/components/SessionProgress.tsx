import { Fragment } from 'react'
import { motion } from 'framer-motion'
import { Art } from './art/Art'
import { stopIcon } from '../screens/MapScreen'
import { currentStop } from '../lib/session'
import type { SessionState } from '../lib/types'

/**
 * A small copy of the practice path, always visible during a session: stops done,
 * where we are, what's left, and a note for each rep of the current stop.
 * Pictures only, so Adler can read it too.
 */
export function SessionProgress({ s }: { s: SessionState }) {
  const stops = s.stops.filter((st) => st.enabled)
  const current = currentStop(s)
  const showReps = current.targetReps > 1

  return (
    <div className="flex shrink-0 items-center justify-center gap-6 px-4 pb-2" aria-label="Practice path">
      <div className="flex items-center">
        {stops.map((st, i) => {
          const idx = s.stops.indexOf(st)
          const done = idx < s.stopIndex
          const here = idx === s.stopIndex
          return (
            <Fragment key={st.id}>
              {i > 0 && <div className={`h-1.5 w-6 rounded-full sm:w-10 ${done || here ? 'bg-leaf' : 'bg-[#e3d3b0]'}`} />}
              <div
                className={`relative flex items-center justify-center rounded-full border-[3px] ${
                  here ? 'anim-glow h-16 w-16 border-ink bg-sun/40' : done ? 'h-12 w-12 border-ink/50 bg-[#e3f5d8]' : 'h-12 w-12 border-ink/30 bg-white'
                }`}
              >
                <Art name={stopIcon(st)} className={here ? 'h-11 w-11' : `h-8 w-8 ${done ? '' : 'opacity-50'}`} />
                {done && (
                  <div className="absolute -top-1.5 -right-1.5">
                    <Art name="star" className="h-6 w-6" />
                  </div>
                )}
              </div>
            </Fragment>
          )
        })}
      </div>
      {showReps && (
        <div className="flex items-center gap-1 rounded-full border-[3px] border-ink/30 bg-white px-3 py-1" aria-label={`${current.repsDone} of ${current.targetReps} missions done`}>
          {Array.from({ length: current.targetReps }, (_, i) => {
            const filled = i < current.repsDone
            return (
              <motion.div key={i} initial={false} animate={{ scale: filled ? [1.5, 1] : 1 }} transition={{ duration: 0.4 }}>
                <Art name="note" className={`h-9 w-9 ${filled ? '' : 'opacity-20 grayscale'}`} />
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
