import { useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Art } from '../components/art/Art'
import { playBigToken, playToken } from '../lib/sound'

/** A token lands: under 3 seconds, then moves on by itself. */
export function CelebrateScreen({ amount, big, onDone }: { amount: number; big?: boolean; onDone: () => void }) {
  const reduce = useReducedMotion()
  useEffect(() => {
    if (big) playBigToken()
    else playToken()
    const t = setTimeout(onDone, 2600)
    return () => clearTimeout(t)
  }, [])

  const notes = Array.from({ length: Math.min(amount, 6) }, (_, i) => i)
  return (
    <div className="relative flex h-full items-center justify-center overflow-hidden">
      {!reduce &&
        Array.from({ length: 10 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute h-12 w-12"
            initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
            animate={{
              x: Math.cos((i / 10) * Math.PI * 2) * 320,
              y: Math.sin((i / 10) * Math.PI * 2) * 220,
              opacity: [0, 1, 0],
              scale: 1,
            }}
            transition={{ duration: 1.6, delay: 0.3 }}
          >
            <Art name="sparkle" className="h-12 w-12" />
          </motion.div>
        ))}
      <div className="flex items-end gap-2">
        {notes.map((i) => (
          <motion.div
            key={i}
            initial={reduce ? { opacity: 0 } : { y: -400, rotate: -30, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { y: 0, rotate: 0, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.5, delay: 0.1 + i * 0.18 }}
          >
            <Art name="note" className={big ? 'h-44 w-44' : 'h-40 w-40'} />
          </motion.div>
        ))}
      </div>
      <motion.div
        className="absolute bottom-6 left-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Art name="buddy" className="anim-bob h-44 w-44" />
      </motion.div>
    </div>
  )
}
