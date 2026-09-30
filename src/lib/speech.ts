// Web Speech narration. iPad Safari only speaks after a user gesture, so the
// first speak() must come from a tap (the Start button does this).

const PREFERRED = [
  'Samantha (Enhanced)',
  'Samantha (Premium)',
  'Ava (Premium)',
  'Ava (Enhanced)',
  'Zoe (Premium)',
  'Zoe (Enhanced)',
  'Samantha',
  'Karen',
  'Moira',
  'Tessa',
  'Serena',
  'Google US English',
]

let chosen: SpeechSynthesisVoice | null = null
let rate = 0.9

export function setSpeechRate(r: number) {
  rate = r
}

function pickVoice(): SpeechSynthesisVoice | null {
  if (chosen) return chosen
  if (typeof speechSynthesis === 'undefined') return null
  const voices = speechSynthesis.getVoices()
  if (!voices.length) return null
  for (const name of PREFERRED) {
    const v = voices.find((x) => x.name === name)
    if (v) return (chosen = v)
  }
  const en = voices.filter((v) => v.lang.startsWith('en'))
  chosen = en.find((v) => /premium|enhanced/i.test(v.name)) ?? en.find((v) => v.lang === 'en-US') ?? en[0] ?? null
  return chosen
}

if (typeof speechSynthesis !== 'undefined') {
  speechSynthesis.addEventListener?.('voiceschanged', () => {
    chosen = null
    pickVoice()
  })
}

export interface SpeakOptions {
  onWord?: (charIndex: number) => void
}

let seq = 0

/** Speak text, cancelling anything already speaking. Resolves when done or interrupted. */
export function speak(text: string, opts: SpeakOptions = {}): Promise<void> {
  if (typeof speechSynthesis === 'undefined' || !text) return Promise.resolve()
  const my = ++seq
  speechSynthesis.cancel()
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text)
    const v = pickVoice()
    if (v) u.voice = v
    u.lang = v?.lang ?? 'en-US'
    u.rate = rate
    u.pitch = 1.05
    u.onboundary = (e) => {
      if (my === seq && e.name !== 'sentence') opts.onWord?.(e.charIndex)
    }
    const done = () => resolve()
    u.onend = done
    u.onerror = done
    speechSynthesis.speak(u)
    // Safari sometimes never fires onend; don't let callers hang.
    setTimeout(done, 1500 + text.length * 120)
  })
}

export function stopSpeaking() {
  seq++
  if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel()
}
