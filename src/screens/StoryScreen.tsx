import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Scene } from '../components/art/Scene'
import { Art } from '../components/art/Art'
import { GoArrow, KidButton } from '../components/ui'
import { personalize } from '../lib/content'
import { speak } from '../lib/speech'
import { playPageTurn } from '../lib/sound'
import type { Child, StoryPage } from '../lib/types'

interface Word {
  text: string
  start: number
  end: number
}

function splitWords(text: string): Word[] {
  const out: Word[] = []
  const re = /\S+/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) out.push({ text: m[0], start: m.index, end: m.index + m[0].length })
  return out
}

/** One illustrated page, read aloud with word-by-word highlighting where the voice reports word boundaries. */
export function StoryPageView({
  page,
  child,
  onNext,
  nextIcon = 'arrow',
  pageKey,
}: {
  page: StoryPage
  child: Child
  onNext: () => void
  nextIcon?: 'arrow' | 'chest'
  pageKey: string
}) {
  const text = personalize(page.text, child)
  const words = useMemo(() => splitWords(text), [text])
  const [active, setActive] = useState(-1)
  const [reading, setReading] = useState(false)

  const read = () => {
    setReading(true)
    setActive(-1)
    void speak(text, {
      onWord: (ci) => setActive(words.findIndex((w) => ci >= w.start && ci < w.end + 1)),
    }).then(() => {
      setReading(false)
      setActive(-1)
    })
  }

  useEffect(() => {
    playPageTurn()
    const t = setTimeout(read, 400)
    return () => clearTimeout(t)
    // Re-read only when the page changes.
  }, [pageKey])

  return (
    <motion.div
      key={pageKey}
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex h-full items-center gap-6 p-4 landscape:flex-row portrait:flex-col"
    >
      <div className="flex min-h-0 w-full flex-[3] items-center justify-center">
        <Scene scene={page.scene} className="max-h-full w-full rounded-3xl border-4 border-ink bg-white shadow-[0_6px_0_#3b2f2f]" />
      </div>
      <div className="flex w-full flex-[2] flex-col items-center justify-center gap-6">
        <button type="button" onClick={read} className="text-left text-3xl leading-snug font-bold" aria-label="Read the page">
          {words.map((w, i) => (
            <span key={i} className={`rounded-md px-0.5 transition-colors ${i === active ? 'bg-sun' : ''}`}>
              {w.text}{' '}
            </span>
          ))}
        </button>
        <KidButton label="Next" onClick={onNext} glow={!reading} className="flex h-28 w-28 items-center justify-center bg-leaf/30">
          {nextIcon === 'chest' ? <Art name="chest" className="h-20 w-20" /> : <GoArrow />}
        </KidButton>
      </div>
    </motion.div>
  )
}
