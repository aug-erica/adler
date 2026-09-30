/**
 * Minutes as pie pieces: one full circle = a full prize (e.g. 30 minutes).
 * Lets a non-reader see "a whole show" versus "part of one".
 */
export function MinutePie({ minutes, full, size = 64, color = '#7cc46a' }: { minutes: number; full: number; size?: number; color?: string }) {
  const pies = Math.max(1, Math.ceil(minutes / full))
  return (
    <div className="flex gap-1" aria-label={`${minutes} minutes`}>
      {Array.from({ length: pies }, (_, i) => {
        const frac = Math.max(0, Math.min(1, (minutes - i * full) / full))
        return <Pie key={i} frac={frac} size={size} color={color} />
      })}
    </div>
  )
}

function Pie({ frac, size, color }: { frac: number; size: number; color: string }) {
  const r = 44
  const a = frac * Math.PI * 2
  const x = 50 + r * Math.sin(a)
  const y = 50 - r * Math.cos(a)
  const large = frac > 0.5 ? 1 : 0
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden>
      <circle cx="50" cy="50" r={r} fill="#fff" stroke="#3b2f2f" strokeWidth={5} />
      {frac >= 0.999 ? (
        <circle cx="50" cy="50" r={r - 2.5} fill={color} />
      ) : frac > 0 ? (
        <path d={`M50 50 L50 ${50 - r} A${r} ${r} 0 ${large} 1 ${x} ${y} Z`} fill={color} />
      ) : null}
      <circle cx="50" cy="50" r={r} fill="none" stroke="#3b2f2f" strokeWidth={5} />
    </svg>
  )
}
