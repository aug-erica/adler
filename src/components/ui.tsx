import { useEffect, useRef, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Art } from './art/Art'
import { speak } from '../lib/speech'
import { playTap } from '../lib/sound'

/** Speak `text` whenever `key` changes (i.e. when a screen appears). */
export function useSpeakOnShow(text: string | null, key: unknown = text) {
  const last = useRef<unknown>(Symbol())
  useEffect(() => {
    if (!text || last.current === key) return
    last.current = key
    void speak(text)
  }, [text, key])
}

/** Big round kid button: icons only, speaks nothing by itself. */
export function KidButton({
  onClick,
  children,
  className = '',
  label,
  glow,
}: {
  onClick: () => void
  children: ReactNode
  className?: string
  label: string
  glow?: boolean
}) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      whileTap={{ scale: 0.92 }}
      onClick={() => {
        playTap()
        onClick()
      }}
      className={`min-h-16 min-w-16 rounded-full border-4 border-ink bg-white shadow-[0_6px_0_#3b2f2f] active:translate-y-1 active:shadow-[0_2px_0_#3b2f2f] ${glow ? 'anim-glow' : ''} ${className}`}
    >
      {children}
    </motion.button>
  )
}

/** Speaker icon to hear the current line once more. */
export function HearButton({ text }: { text: string }) {
  return (
    <KidButton label="Hear it" onClick={() => void speak(text)} className="flex h-20 w-20 items-center justify-center bg-sky/20">
      <svg viewBox="0 0 48 48" className="h-11 w-11" aria-hidden>
        <path d="M8 18 h8 l10 -8 v28 l-10 -8 h-8z" fill="#3b2f2f" />
        <path d="M32 16 q6 8 0 16 M36 11 q11 13 0 26" stroke="#3b2f2f" strokeWidth={3.5} fill="none" strokeLinecap="round" />
      </svg>
    </KidButton>
  )
}

export function TokenCounter({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-1 rounded-full border-4 border-ink bg-white px-4 py-1 text-3xl font-extrabold shadow-[0_4px_0_#3b2f2f]" aria-label={`${count} notes`}>
      <Art name="note" className="h-10 w-10" />
      <span className="tabular-nums">{count}</span>
    </div>
  )
}

export function GoArrow() {
  return (
    <svg viewBox="0 0 48 48" className="h-14 w-14" aria-hidden>
      <path d="M12 8 l26 16 l-26 16z" fill="#7cc46a" stroke="#3b2f2f" strokeWidth={3.5} strokeLinejoin="round" />
    </svg>
  )
}

/** Parent-only strip: small, muted, readable. */
export function ParentStrip({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-24 shrink-0 items-center gap-3 border-t-2 border-ink/15 bg-white/70 px-4 py-2 text-sm text-ink/80">
      {children}
    </div>
  )
}

export function ParentButton({
  onClick,
  children,
  variant = 'plain',
  label,
  className = '',
}: {
  onClick: () => void
  children: ReactNode
  variant?: 'plain' | 'primary' | 'quiet'
  label?: string
  className?: string
}) {
  const styles = {
    primary: 'bg-leaf text-ink border-ink font-bold text-base',
    plain: 'bg-white text-ink border-ink/40',
    quiet: 'bg-transparent text-ink/60 border-transparent',
  }[variant]
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`min-h-14 rounded-2xl border-2 px-4 py-2 active:scale-95 ${styles} ${className}`}
    >
      {children}
    </button>
  )
}

/** The unlabeled leaf that starts Reset mode. */
export function LeafButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" aria-label="Calm break" onClick={onClick} className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-ink/20 bg-calm active:scale-95">
      <Art name="leaf" className="h-9 w-9" />
    </button>
  )
}
