import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Art } from '../components/art/Art'
import { HearButton, KidButton, useSpeakOnShow } from '../components/ui'
import { lines, personalize } from '../lib/content'
import { speak } from '../lib/speech'
import { playBigToken } from '../lib/sound'
import type { Child, SessionState } from '../lib/types'

const BREATHS = 6
const BREATH_MS = 8000 // 4s in, 4s out
const SQUEEZES = 6
const SQUEEZE_MAX_MS = 75_000

/** Dots that fill up: shows the break is short and has an end. */
function BreakDots({ total, done }: { total: number; done: number }) {
  return (
    <div className="flex gap-3" aria-hidden>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className={`h-7 w-7 rounded-full border-4 border-ink/40 transition-colors duration-700 ${i < done ? 'bg-leaf' : 'bg-white'}`} />
      ))}
    </div>
  )
}

function Breathe({ onDone }: { onDone: () => void }) {
  const reduce = useReducedMotion()
  const [done, setDone] = useState(0)
  useEffect(() => {
    void speak(lines.resetBreathe)
    const iv = setInterval(() => setDone((d) => d + 1), BREATH_MS)
    return () => clearInterval(iv)
  }, [])
  useEffect(() => {
    if (done >= BREATHS) onDone()
  }, [done, onDone])
  return (
    <div className="flex flex-col items-center gap-8">
      <motion.div
        animate={{ scale: [0.55, 1, 0.55] }}
        transition={{ duration: BREATH_MS / 1000, repeat: Infinity, ease: 'easeInOut' }}
        style={reduce ? { opacity: 0.9 } : undefined}
      >
        <Art name="balloon" className="h-72 w-72" />
      </motion.div>
      <BreakDots total={BREATHS} done={done} />
    </div>
  )
}

function Squeeze({ onDone }: { onDone: () => void }) {
  const [done, setDone] = useState(0)
  const [pressed, setPressed] = useState(false)
  const pressStart = useRef(0)
  useEffect(() => {
    void speak(lines.resetSqueeze)
    const t = setTimeout(onDone, SQUEEZE_MAX_MS)
    return () => clearTimeout(t)
  }, [onDone])
  useEffect(() => {
    if (done >= SQUEEZES) onDone()
  }, [done, onDone])
  return (
    <div className="flex flex-col items-center gap-8">
      <motion.button
        type="button"
        aria-label="Squishy"
        animate={{ scaleX: pressed ? 1.25 : 1, scaleY: pressed ? 0.7 : 1 }}
        transition={{ type: 'spring', bounce: 0.6 }}
        onPointerDown={() => {
          pressStart.current = Date.now()
          setPressed(true)
        }}
        onPointerUp={() => {
          if (pressed && Date.now() - pressStart.current > 300) setDone((d) => d + 1)
          setPressed(false)
        }}
        onPointerLeave={() => setPressed(false)}
        className="touch-none"
      >
        <Art name="squishy" className="h-72 w-72" />
      </motion.button>
      <BreakDots total={SQUEEZES} done={done} />
    </div>
  )
}

export function ResetScreen({ s, child, onChoose, onActivityEnd, onWelcomeEnd }: {
  s: SessionState
  child: Child
  onChoose: (a: 'breathe' | 'squeeze') => void
  onActivityEnd: () => void
  onWelcomeEnd: () => void
}) {
  const stage = s.resetStage
  const chooseText = `${lines.resetIntro} ${lines.resetChoose}`
  useSpeakOnShow(stage === 'choose' ? chooseText : null, `${s.resetStageAt}-choose`)
  useSpeakOnShow(stage === 'return' ? personalize(lines.resetReturn, child) : null, `${s.resetStageAt}-return`)

  useEffect(() => {
    if (stage !== 'welcome') return
    playBigToken()
    void speak(lines.resetWelcomeBack)
    const t = setTimeout(onWelcomeEnd, 4500)
    return () => clearTimeout(t)
  }, [stage, onWelcomeEnd])

  return (
    <div className="flex h-full items-center justify-center gap-10 bg-calm p-4">
      <Art name="buddy" className="h-48 w-48 opacity-90" />
      {stage === 'choose' && (
        <div className="flex flex-col items-center gap-6">
          <div className="flex gap-10">
            <KidButton label="Balloon" onClick={() => onChoose('breathe')} className="flex h-52 w-52 items-center justify-center rounded-[2.5rem]! bg-[#fbe4ee]">
              <Art name="balloon" className="h-40 w-40" />
            </KidButton>
            <KidButton label="Squishy" onClick={() => onChoose('squeeze')} className="flex h-52 w-52 items-center justify-center rounded-[2.5rem]! bg-[#dff5f8]">
              <Art name="squishy" className="h-40 w-40" />
            </KidButton>
          </div>
          <HearButton text={chooseText} />
        </div>
      )}
      {stage === 'breathe' && <Breathe onDone={onActivityEnd} />}
      {stage === 'squeeze' && <Squeeze onDone={onActivityEnd} />}
      {stage === 'return' && (
        <div className="flex flex-col items-center gap-6">
          <div className="flex h-72 w-72 items-center justify-center rounded-[2.5rem] border-4 border-ink bg-white shadow-[0_6px_0_#3b2f2f]">
            <Art name="oneNote" className="h-52 w-52" />
          </div>
          <HearButton text={personalize(lines.resetReturn, child)} />
        </div>
      )}
      {stage === 'welcome' && (
        <motion.div initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', bounce: 0.5 }} className="flex items-end gap-3">
          <Art name="note" className="h-40 w-40" />
          <Art name="sparkle" className="h-20 w-20" />
          <Art name="note" className="h-40 w-40" />
          <Art name="note" className="h-40 w-40" />
        </motion.div>
      )}
    </div>
  )
}
