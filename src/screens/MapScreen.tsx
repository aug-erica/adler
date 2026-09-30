import { Art } from '../components/art/Art'
import { KidButton } from '../components/ui'
import { chunkById, goalById, lines } from '../lib/content'
import type { SessionState, Stop } from '../lib/types'
import { useSpeakOnShow } from '../components/ui'

export function stopIcon(stop: Stop): string {
  switch (stop.type) {
    case 'warmup':
      return 'star'
    case 'focus':
      return goalById(chunkById(stop.chunkId)?.goalId ?? '')?.iconKey ?? 'note'
    case 'break':
      return 'wiggle'
    case 'concert':
      return 'stage'
    case 'treasure':
      return 'chest'
  }
}

export const STOP_NAMES: Record<Stop['type'], string> = {
  warmup: 'Warm-up win',
  focus: 'Focus chunk',
  break: 'Wiggle break',
  concert: 'Concert',
  treasure: 'Treasure',
}

export function MapScreen({ s, onEnter, onToggle }: { s: SessionState; onEnter: () => void; onToggle: (id: string) => void }) {
  const line = s.started ? `${lines.chunkDone} ${lines.mapNext}` : `${lines.mapIntro} ${lines.mapNext}`
  useSpeakOnShow(line, `${s.id}-${s.stopIndex}-${s.started}`)
  const visible = s.stops.filter((st) => st.enabled || !s.started)

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-4">
      <div className="relative flex w-full max-w-5xl items-center justify-between">
        <div className="absolute inset-x-16 top-1/2 -translate-y-1/2 border-t-8 border-dashed border-[#e3d3b0]" aria-hidden />
        {visible.map((st) => {
          const idx = s.stops.indexOf(st)
          const current = idx === s.stopIndex
          const done = idx < s.stopIndex && st.enabled
          const skipped = !st.enabled
          return (
            <div key={st.id} className="relative flex flex-col items-center">
              {current ? (
                <KidButton label={STOP_NAMES[st.type]} onClick={onEnter} glow className="flex h-36 w-36 items-center justify-center bg-sun/30">
                  <Art name={stopIcon(st)} className="h-24 w-24" />
                </KidButton>
              ) : (
                <div
                  className={`relative flex h-28 w-28 items-center justify-center rounded-full border-4 border-ink/60 ${skipped ? 'opacity-25' : ''} ${done ? 'bg-[#e3f5d8]' : 'bg-white'}`}
                >
                  <Art name={stopIcon(st)} className="h-18 w-18" />
                  {done && (
                    <div className="absolute -top-2 -right-2 h-12 w-12">
                      <Art name="star" className="h-12 w-12" />
                    </div>
                  )}
                </div>
              )}
              {!s.started && st.type !== 'treasure' && (
                <button
                  type="button"
                  onClick={() => onToggle(st.id)}
                  className="absolute top-full mt-3 min-h-10 rounded-lg border border-ink/20 bg-white/80 px-2 text-xs whitespace-nowrap text-ink/60"
                >
                  {st.enabled ? 'Skip' : 'Keep'} {STOP_NAMES[st.type].toLowerCase()}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
