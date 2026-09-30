import { Art } from '../components/art/Art'
import { GoArrow, KidButton } from '../components/ui'
import { MinutePie } from '../components/MinutePie'
import { lines, personalize, rewardSettings } from '../lib/content'
import { speak } from '../lib/speech'
import { unlockAudio } from '../lib/sound'
import type { Child } from '../lib/types'

export function HomeScreen({ child, bank, onStart, onSettings }: { child: Child; bank: number; onStart: () => void; onSettings: () => void }) {
  const hello = personalize(lines.homeHello, child)
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-6 p-6">
      {bank > 0 && (
        <div className="absolute top-5 right-5 flex items-center gap-2 rounded-full border-4 border-ink bg-white px-3 py-1 shadow-[0_4px_0_#3b2f2f]" aria-label={`Weekend treasure: ${bank} minutes`}>
          <Art name="piggy" className="h-12 w-12" />
          <MinutePie minutes={bank} full={rewardSettings.fullPrizeMinutes} size={40} color="#f7a8c8" />
        </div>
      )}
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
