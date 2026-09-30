import { Art } from '../components/art/Art'
import { GoArrow, KidButton, TokenCounter } from '../components/ui'
import { lines, personalize } from '../lib/content'
import { speak } from '../lib/speech'
import { unlockAudio } from '../lib/sound'
import type { Child } from '../lib/types'

export function HomeScreen({ child, balance, onStart, onSettings }: { child: Child; balance: number; onStart: () => void; onSettings: () => void }) {
  const hello = personalize(lines.homeHello, child)
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-6 p-6">
      <div className="absolute top-5 right-5">
        <TokenCounter count={balance} />
      </div>
      <button
        type="button"
        aria-label={`${child.buddyName} says hi`}
        className="anim-bob"
        onClick={() => {
          unlockAudio()
          void speak(hello)
        }}
      >
        <Art name="buddy" className="h-72 w-72 max-h-[45vh] max-w-[45vh]" />
      </button>
      <KidButton
        label="Start"
        glow
        className="flex h-36 w-36 items-center justify-center bg-leaf/30"
        onClick={() => {
          unlockAudio()
          onStart()
        }}
      >
        <GoArrow />
      </KidButton>
      <button type="button" onClick={onSettings} className="absolute bottom-4 left-4 min-h-12 rounded-xl px-3 text-sm text-ink/40">
        Grown-up settings
      </button>
    </div>
  )
}
