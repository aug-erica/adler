import type { Scene as SceneT } from '../../lib/types'
import { ArtG } from './Art'

const INK = '#3b2f2f'

function Background({ bg }: { bg: SceneT['bg'] }) {
  switch (bg) {
    case 'meadow':
      return (
        <g>
          <rect width="400" height="250" fill="#cdeafe" />
          <ellipse cx="90" cy="230" rx="200" ry="60" fill="#a5d98f" />
          <ellipse cx="330" cy="235" rx="180" ry="55" fill="#95cf7e" />
          <rect y="215" width="400" height="35" fill="#8cc873" />
          <g fill="#fff" opacity={0.9}>
            <ellipse cx="120" cy="50" rx="30" ry="12" />
            <ellipse cx="145" cy="44" rx="22" ry="12" />
            <ellipse cx="250" cy="34" rx="26" ry="10" />
          </g>
        </g>
      )
    case 'pond':
      return (
        <g>
          <rect width="400" height="250" fill="#d6f0ff" />
          <rect y="140" width="400" height="40" fill="#8cc873" />
          <path d="M0 170 q200 -30 400 0 v80 h-400z" fill="#6ec1e8" stroke={INK} strokeWidth={2} />
          <path d="M40 200 q10 -4 20 0 M300 215 q12 -4 24 0 M170 235 q10 -4 20 0" stroke="#fff" strokeWidth={2} fill="none" />
        </g>
      )
    case 'night':
      return (
        <g>
          <rect width="400" height="250" fill="#2d3561" />
          <g fill="#fff8d6">
            {[
              [40, 30],
              [120, 60],
              [190, 25],
              [260, 50],
              [370, 30],
              [300, 120],
              [80, 120],
            ].map(([x, y]) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r={2} />
            ))}
          </g>
          <rect y="215" width="400" height="35" fill="#3f4a7a" />
        </g>
      )
    case 'stage':
      return (
        <g>
          <rect width="400" height="250" fill="#5b2a3d" />
          <rect y="210" width="400" height="40" fill="#a0632e" />
        </g>
      )
  }
}

export function Scene({ scene, className }: { scene: SceneT; className?: string }) {
  return (
    <svg viewBox="0 0 400 250" className={className} aria-hidden>
      <Background bg={scene.bg} />
      {scene.items.map((it, i) => (
        <g key={i} className={it.wiggle ? 'anim-wiggle' : 'anim-bob'} style={{ animationDelay: `${i * 0.35}s`, transformOrigin: `${it.x}px ${it.y}px` }}>
          <ArtG name={it.art} x={it.x} y={it.y} size={it.s} flip={it.flip} sleepy={it.sleepy} />
        </g>
      ))}
    </svg>
  )
}
