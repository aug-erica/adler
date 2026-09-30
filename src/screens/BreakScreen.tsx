import { useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Art } from '../components/art/Art'
import { GoArrow, KidButton } from '../components/ui'
import { lines } from '../lib/content'
import { speak } from '../lib/speech'

const BREAK_MS = 45_000

/** A 45-second wiggle break. No visible countdown; the arrow appears when it's over. */
export function BreakScreen({ onDone }: { onDone: () => void }) {
  const reduce = useReducedMotion()
  const prompts = useMemo(() => {
    const p = lines.breakPrompts.slice().sort(() => Math.random() - 0.5)
    return [p[0], p[1]]
  }, [])
  const [finished, setFinished] = useState(false)
  const [which, setWhich] = useState(0)

  useEffect(() => {
    void speak(`${lines.breakIntro} ${prompts[0]}`)
    const t1 = setTimeout(() => {
      setWhich(1)
      void speak(prompts[1])
    }, BREAK_MS / 2)
    const t2 = setTimeout(() => {
      setFinished(true)
      void speak(lines.breakDone)
    }, BREAK_MS)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [prompts])

  const icon = /dinosaur/i.test(prompts[which]) ? 'dino' : /cat/i.test(prompts[which]) ? 'cat' : /bunny/i.test(prompts[which]) ? 'bunny' : 'wiggle'

  return (
    <div className="flex h-full items-center justify-center gap-10 p-4">
      <motion.div
        animate={reduce ? {} : { rotate: [-8, 8, -8], y: [0, -20, 0] }}
        transition={{ duration: 0.9, repeat: Infinity }}
      >
        <Art name="buddy" className="h-64 w-64" />
      </motion.div>
      <motion.div
        key={which}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={reduce ? { scale: 1, opacity: 1 } : { scale: [1, 1.1, 1], opacity: 1 }}
        transition={{ duration: 1.2, repeat: reduce ? 0 : Infinity }}
      >
        <Art name={icon} className="h-64 w-64" />
      </motion.div>
      {finished && (
        <KidButton label="Back to the piano" onClick={onDone} glow className="flex h-28 w-28 items-center justify-center bg-leaf/30">
          <GoArrow />
        </KidButton>
      )}
    </div>
  )
}
