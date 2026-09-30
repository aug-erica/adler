import { createContext, useContext, type ReactNode } from 'react'
import type { BuddyAnimal } from '../../lib/types'

// Every drawing lives in a 100×100 box with its feet at the bottom (y≈96).
// Simple, original, friendly shapes; the Goblin is silly, never scary.

const INK = '#3b2f2f'
const S = { stroke: INK, strokeWidth: 2.5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const }

export const BuddyContext = createContext<BuddyAnimal>('fox')

interface Opts {
  sleepy?: boolean
}

function Eyes({ x1, x2, y, sleepy, r = 3.2 }: { x1: number; x2: number; y: number; sleepy?: boolean; r?: number }) {
  if (sleepy) {
    return (
      <g {...S} fill="none">
        <path d={`M${x1 - 4} ${y} q4 3 8 0`} />
        <path d={`M${x2 - 4} ${y} q4 3 8 0`} />
      </g>
    )
  }
  return (
    <g fill={INK}>
      <circle cx={x1} cy={y} r={r} />
      <circle cx={x2} cy={y} r={r} />
      <circle cx={x1 + 1} cy={y - 1} r={1} fill="#fff" />
      <circle cx={x2 + 1} cy={y - 1} r={1} fill="#fff" />
    </g>
  )
}

function Smile({ x, y, w = 8 }: { x: number; y: number; w?: number }) {
  return <path d={`M${x - w / 2} ${y} q${w / 2} ${w / 2} ${w} 0`} {...S} fill="none" />
}

function Cheeks({ x1, x2, y }: { x1: number; x2: number; y: number }) {
  return (
    <g fill="#f4a3a3" opacity={0.7}>
      <circle cx={x1} cy={y} r={3.5} />
      <circle cx={x2} cy={y} r={3.5} />
    </g>
  )
}

const drawings: Record<string, (o: Opts) => ReactNode> = {
  fox: (o) => (
    <g>
      <path d="M72 80 q24 -6 20 -30 q-10 16 -24 18z" fill="#f28c38" {...S} />
      <ellipse cx="50" cy="78" rx="22" ry="18" fill="#f28c38" {...S} />
      <ellipse cx="50" cy="82" rx="11" ry="11" fill="#fff4e6" />
      <path d="M26 30 l6 -22 l14 16z" fill="#f28c38" {...S} />
      <path d="M74 30 l-6 -22 l-14 16z" fill="#f28c38" {...S} />
      <path d="M22 38 q28 -26 56 0 q2 22 -28 30 q-30 -8 -28 -30z" fill="#f28c38" {...S} />
      <path d="M36 52 q14 16 28 0 q-6 14 -14 14 q-8 0 -14 -14z" fill="#fff4e6" />
      <Eyes x1={40} x2={60} y={44} sleepy={o.sleepy} />
      <circle cx="50" cy="56" r="3" fill={INK} />
      <Cheeks x1={33} x2={67} y={52} />
    </g>
  ),
  bunny: (o) => (
    <g>
      <ellipse cx="38" cy="18" rx="7" ry="18" fill="#f1ece4" {...S} />
      <ellipse cx="62" cy="18" rx="7" ry="18" fill="#f1ece4" {...S} />
      <ellipse cx="38" cy="20" rx="3" ry="12" fill="#f7b9c4" />
      <ellipse cx="62" cy="20" rx="3" ry="12" fill="#f7b9c4" />
      <ellipse cx="50" cy="80" rx="22" ry="17" fill="#f1ece4" {...S} />
      <circle cx="50" cy="48" r="22" fill="#f1ece4" {...S} />
      <Eyes x1={42} x2={58} y={46} sleepy={o.sleepy} />
      <path d="M47 54 h6 l-3 3z" fill="#f28c9c" />
      <Smile x={50} y={58} w={6} />
      <Cheeks x1={35} x2={65} y={54} />
    </g>
  ),
  owl: (o) => (
    <g>
      <path d="M22 40 q0 -26 28 -26 q28 0 28 26 v32 q0 22 -28 22 q-28 0 -28 -22z" fill="#9b7653" {...S} />
      <path d="M22 22 l8 12 M78 22 l-8 12" {...S} />
      <ellipse cx="50" cy="74" rx="16" ry="16" fill="#e8d5b5" />
      <circle cx="39" cy="42" r="11" fill="#fff" {...S} />
      <circle cx="61" cy="42" r="11" fill="#fff" {...S} />
      <Eyes x1={39} x2={61} y={42} sleepy={o.sleepy} r={4.5} />
      <path d="M46 52 l4 7 l4 -7z" fill="#f2b33d" {...S} />
      <path d="M40 94 v4 M60 94 v4" {...S} stroke="#f2b33d" />
    </g>
  ),
  turtle: (o) => (
    <g>
      <ellipse cx="80" cy="74" rx="12" ry="10" fill="#8fce7a" {...S} />
      <path d="M22 86 q-2 -34 30 -38 q34 2 32 38z" fill="#5a9e4b" {...S} />
      <path d="M38 60 l14 -6 l14 6 l-2 14 h-24z" fill="#77b865" stroke={INK} strokeWidth={1.5} />
      <ellipse cx="30" cy="92" rx="8" ry="5" fill="#8fce7a" {...S} />
      <ellipse cx="72" cy="92" rx="8" ry="5" fill="#8fce7a" {...S} />
      <circle cx="18" cy="62" r="15" fill="#8fce7a" {...S} />
      <Eyes x1={13} x2={23} y={59} sleepy={o.sleepy} r={2.6} />
      <Smile x={18} y={67} w={7} />
    </g>
  ),
  bear: (o) => (
    <g>
      <circle cx="28" cy="22" r="10" fill="#a0673a" {...S} />
      <circle cx="72" cy="22" r="10" fill="#a0673a" {...S} />
      <ellipse cx="50" cy="78" rx="28" ry="20" fill="#a0673a" {...S} />
      <ellipse cx="50" cy="80" rx="15" ry="12" fill="#d9b48f" />
      <circle cx="50" cy="42" r="26" fill="#a0673a" {...S} />
      <ellipse cx="50" cy="52" rx="11" ry="8" fill="#d9b48f" />
      <Eyes x1={40} x2={60} y={38} sleepy={o.sleepy} />
      <ellipse cx="50" cy="48" rx="4" ry="3" fill={INK} />
      <Smile x={50} y={54} w={7} />
    </g>
  ),
  teddy: () => (
    <g transform="translate(15 20) scale(0.7)">
      {drawings.bear({})}
      <path d="M40 70 l10 6 l10 -6 v10 l-10 -6 l-10 6z" fill="#e25b5b" {...S} />
    </g>
  ),
  fish: (o) => (
    <g>
      <path d="M78 60 l18 -16 v32z" fill="#f28c38" {...S} />
      <ellipse cx="46" cy="60" rx="34" ry="22" fill="#f7a44a" {...S} />
      <path d="M40 40 q10 -14 22 -2" fill="#f28c38" {...S} />
      <path d="M52 50 q6 10 0 20 M62 50 q6 10 0 20" stroke="#e07a2a" strokeWidth={2} fill="none" />
      <circle cx="28" cy="54" r={o.sleepy ? 0 : 5} fill="#fff" {...S} />
      {o.sleepy ? <path d="M23 55 q5 3 10 0" {...S} fill="none" /> : <circle cx="29" cy="54" r="2.4" fill={INK} />}
      <path d="M16 66 q5 4 9 0" {...S} fill="none" />
    </g>
  ),
  mouse: (o) => (
    <g>
      <path d="M78 86 q18 4 16 -14" {...S} fill="none" />
      <circle cx="30" cy="42" r="14" fill="#c9c3cc" {...S} />
      <circle cx="30" cy="42" r="7" fill="#f7b9c4" />
      <ellipse cx="56" cy="76" rx="24" ry="18" fill="#c9c3cc" {...S} />
      <path d="M30 70 q8 -30 30 -24 q-6 20 -30 24z" fill="#c9c3cc" {...S} />
      <circle cx="44" cy="58" r="16" fill="#c9c3cc" {...S} />
      <Eyes x1={38} x2={50} y={56} sleepy={o.sleepy} r={2.6} />
      <circle cx="30" cy="62" r="3" fill="#f28c9c" />
    </g>
  ),
  cat: (o) => (
    <g>
      <path d="M72 84 q22 0 18 -24" {...S} fill="none" strokeWidth={5} stroke="#f2b33d" />
      <path d="M72 84 q22 0 18 -24" fill="none" stroke={INK} strokeWidth={1} />
      <ellipse cx="50" cy="78" rx="22" ry="17" fill="#f2b33d" {...S} />
      <path d="M28 34 l2 -20 l14 12z M72 34 l-2 -20 l-14 12z" fill="#f2b33d" {...S} />
      <circle cx="50" cy="44" r="22" fill="#f2b33d" {...S} />
      <path d="M42 26 v8 M50 24 v8 M58 26 v8" stroke="#d9901f" strokeWidth={2.5} strokeLinecap="round" />
      <Eyes x1={42} x2={58} y={44} sleepy={o.sleepy} />
      <path d="M47 51 h6 l-3 3z" fill="#f28c9c" />
      <path d="M44 56 q3 3 6 0 q3 3 6 0" {...S} fill="none" />
      <path d="M30 52 h-10 M30 56 l-9 3 M70 52 h10 M70 56 l9 3" stroke={INK} strokeWidth={1.5} />
    </g>
  ),
  dino: (o) => (
    <g>
      <path d="M20 84 q-16 -2 -18 -18 q14 8 26 4z" fill="#7cc46a" {...S} />
      <ellipse cx="44" cy="74" rx="26" ry="20" fill="#7cc46a" {...S} />
      <path d="M52 64 q0 -40 20 -48 q24 -2 24 16 q0 12 -18 12 q-6 0 -6 10 v14z" fill="#7cc46a" {...S} />
      <path d="M30 56 l4 -8 l4 8 M40 52 l4 -8 l4 8" fill="#f2b33d" {...S} />
      <Eyes x1={76} x2={84} y={26} sleepy={o.sleepy} r={2.6} />
      <path d="M80 36 q6 3 12 -2" {...S} fill="none" />
      <path d="M32 92 v6 h8 v-6 M52 92 v6 h8 v-6" fill="#7cc46a" {...S} />
    </g>
  ),
  robot: (o) => (
    <g>
      <path d="M50 8 v10" {...S} />
      <circle cx="50" cy="7" r="4" fill="#e25b5b" {...S} />
      <rect x="26" y="18" width="48" height="36" rx="8" fill="#9fb8cf" {...S} />
      {o.sleepy ? (
        <path d="M34 36 h10 M56 36 h10" {...S} />
      ) : (
        <g>
          <rect x="34" y="30" width="10" height="10" rx="2" fill="#fff" {...S} />
          <rect x="56" y="30" width="10" height="10" rx="2" fill="#fff" {...S} />
          <rect x="37" y="33" width="4" height="4" fill={INK} />
          <rect x="59" y="33" width="4" height="4" fill={INK} />
        </g>
      )}
      <path d="M40 47 h20" {...S} />
      <rect x="30" y="58" width="40" height="32" rx="6" fill="#9fb8cf" {...S} />
      <circle cx="42" cy="70" r="3" fill="#f2b33d" />
      <circle cx="58" cy="70" r="3" fill="#7cc46a" />
      <path d="M30 66 h-10 v14 M70 66 h10 v14 M40 90 v8 M60 90 v8" {...S} fill="none" />
    </g>
  ),
  bird: (o) => (
    <g>
      <path d="M20 64 q-14 -4 -16 -18 q14 6 22 6z" fill="#5aa9e6" {...S} />
      <ellipse cx="50" cy="60" rx="30" ry="24" fill="#5aa9e6" {...S} />
      <path d="M40 60 q14 -14 26 4 q-14 10 -26 -4z" fill="#3b8ed0" {...S} />
      <Eyes x1={66} x2={66} y={50} sleepy={o.sleepy} />
      <path d="M78 54 l12 4 l-12 4z" fill="#f2b33d" {...S} />
      <path d="M44 84 v10 M56 84 v10" {...S} stroke="#f2b33d" />
    </g>
  ),
  goblin: (o) => (
    <g>
      <path d="M22 36 l-18 -10 l10 20z M78 36 l18 -10 l-10 20z" fill="#8bc34a" {...S} />
      <rect x="32" y="66" width="36" height="26" rx="10" fill="#7e57c2" {...S} />
      <path d="M36 92 v6 h10 M64 92 v6 h-10" {...S} fill="none" />
      <ellipse cx="50" cy="44" rx="28" ry="24" fill="#8bc34a" {...S} />
      <path d="M36 32 l8 3 M64 32 l-8 3" {...S} />
      <Eyes x1={40} x2={60} y={42} sleepy={o.sleepy} r={3.6} />
      <ellipse cx="50" cy="51" rx="5" ry="4" fill="#6fa33a" />
      {o.sleepy ? (
        <path d="M44 60 q6 3 12 0" {...S} fill="none" />
      ) : (
        <path d="M42 60 q8 -4 16 0" {...S} fill="none" />
      )}
      <path d="M44 18 q6 -10 12 0" fill="#7e57c2" {...S} />
    </g>
  ),
  tree: () => (
    <g>
      <rect x="44" y="56" width="12" height="40" fill="#8d6e4c" {...S} />
      <circle cx="50" cy="36" r="24" fill="#6dbb63" {...S} />
      <circle cx="32" cy="48" r="14" fill="#6dbb63" {...S} />
      <circle cx="68" cy="48" r="14" fill="#6dbb63" {...S} />
    </g>
  ),
  tallTree: () => drawings.tree({}),
  flower: () => (
    <g>
      <path d="M50 50 v46" stroke="#4f9a45" strokeWidth={4} />
      <path d="M50 80 q-16 -2 -18 -14 q14 0 18 14z" fill="#6dbb63" {...S} />
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="50" cy="26" rx="9" ry="14" fill="#f7a8c8" {...S} transform={`rotate(${a} 50 40)`} />
      ))}
      <circle cx="50" cy="40" r="10" fill="#f2c94c" {...S} />
      <Smile x={50} y={42} w={6} />
    </g>
  ),
  sun: () => (
    <g>
      {Array.from({ length: 8 }, (_, i) => (
        <path key={i} d="M50 6 v12" stroke="#f2b33d" strokeWidth={5} strokeLinecap="round" transform={`rotate(${i * 45} 50 50)`} />
      ))}
      <circle cx="50" cy="50" r="24" fill="#f7cf4a" {...S} />
      <Eyes x1={42} x2={58} y={46} />
      <Smile x={50} y={56} w={10} />
    </g>
  ),
  moon: () => (
    <g>
      <path d="M62 10 a40 40 0 1 0 28 64 a32 32 0 1 1 -28 -64z" fill="#f7e27a" {...S} />
      <path d="M40 52 q4 3 8 0" {...S} fill="none" />
    </g>
  ),
  star: () => (
    <path
      d="M50 6 l12 28 l30 3 l-23 20 l7 30 l-26 -16 l-26 16 l7 -30 l-23 -20 l30 -3z"
      fill="#f7cf4a"
      {...S}
    />
  ),
  note: () => (
    <g>
      <path d="M58 16 v56" {...S} strokeWidth={5} />
      <path d="M58 16 q24 6 22 26 q-4 -12 -22 -12" fill={INK} />
      <ellipse cx="44" cy="74" rx="16" ry="12" fill="#7e57c2" {...S} transform="rotate(-20 44 74)" />
    </g>
  ),
  notes: () => (
    <g>
      <g transform="translate(-14 10) scale(0.7)">{drawings.note({})}</g>
      <g transform="translate(40 -4) scale(0.7)">{drawings.note({})}</g>
    </g>
  ),
  oneNote: () => drawings.note({}),
  bag: () => (
    <g>
      <path d="M22 44 q-10 50 28 50 q38 0 28 -50z" fill="#b89968" {...S} />
      <path d="M30 44 q20 -14 40 0" fill="#a0835a" {...S} />
      <path d="M36 36 q14 -10 28 0" stroke="#7e57c2" strokeWidth={4} fill="none" />
      <path d="M50 58 v20 M44 72 l6 6 l6 -6" stroke={INK} strokeWidth={2} fill="none" opacity={0.3} />
    </g>
  ),
  rock: () => <path d="M8 96 q2 -34 30 -40 q34 -6 50 16 q8 12 4 24z" fill="#a8a29a" {...S} />,
  piano: () => (
    <g>
      <rect x="6" y="30" width="88" height="40" rx="4" fill="#4a3b52" {...S} />
      <rect x="10" y="52" width="80" height="18" fill="#fff" {...S} />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <path key={i} d={`M${10 + i * 10} 52 v18`} stroke={INK} strokeWidth={1.5} />
      ))}
      {[1, 2, 4, 5, 6].map((i) => (
        <rect key={i} x={10 + i * 10 - 3} y="52" width="6" height="10" fill={INK} />
      ))}
      <path d="M14 70 v26 M86 70 v26" {...S} strokeWidth={4} />
    </g>
  ),
  bubbles: () => (
    <g fill="#d9f1ff" {...S} strokeWidth={2}>
      <circle cx="30" cy="80" r="10" />
      <circle cx="56" cy="54" r="14" />
      <circle cx="40" cy="24" r="8" />
    </g>
  ),
  lid: () => (
    <g>
      <ellipse cx="50" cy="80" rx="46" ry="14" fill="#8d8d8d" {...S} />
      <rect x="42" y="58" width="16" height="16" rx="4" fill="#6d6d6d" {...S} />
    </g>
  ),
  splash: () => (
    <g fill="#9bd4f5" {...S} strokeWidth={2}>
      <path d="M10 96 q10 -30 20 -10 q6 -34 20 -4 q10 -30 20 4 q8 -20 20 10z" />
    </g>
  ),
  bed: () => (
    <g>
      <rect x="6" y="60" width="88" height="24" rx="4" fill="#7e9bd6" {...S} />
      <rect x="6" y="40" width="10" height="56" rx="3" fill="#8d6e4c" {...S} />
      <rect x="84" y="50" width="10" height="46" rx="3" fill="#8d6e4c" {...S} />
      <ellipse cx="28" cy="58" rx="12" ry="6" fill="#fff" {...S} />
    </g>
  ),
  zzz: () => (
    <g fill="none" {...S} strokeWidth={3}>
      <path d="M20 70 h14 l-14 14 h14" />
      <path d="M44 44 h18 l-18 18 h18" />
      <path d="M72 14 h20 l-20 20 h20" />
    </g>
  ),
  house: () => (
    <g>
      <path d="M12 50 l38 -36 l38 36z" fill="#e25b5b" {...S} />
      <rect x="20" y="48" width="60" height="46" fill="#f5e0c3" {...S} />
      <rect x="42" y="66" width="16" height="28" fill="#8d6e4c" {...S} />
      <rect x="26" y="58" width="12" height="12" fill="#bfe3f7" {...S} />
      <rect x="62" y="58" width="12" height="12" fill="#bfe3f7" {...S} />
    </g>
  ),
  chest: () => (
    <g>
      <path d="M12 44 q0 -26 38 -26 q38 0 38 26z" fill="#c07a3a" {...S} />
      <rect x="12" y="44" width="76" height="46" rx="4" fill="#a0632e" {...S} />
      <path d="M12 44 h76 M30 18 v72 M70 18 v72" stroke="#f2b33d" strokeWidth={5} />
      <rect x="42" y="38" width="16" height="16" rx="3" fill="#f2b33d" {...S} />
    </g>
  ),
  chestOpen: () => (
    <g>
      <path d="M12 40 l6 -30 h64 l6 30z" fill="#c07a3a" {...S} />
      <circle cx="36" cy="40" r="8" fill="#f7cf4a" {...S} />
      <circle cx="52" cy="36" r="8" fill="#f7cf4a" {...S} />
      <circle cx="66" cy="42" r="8" fill="#f7cf4a" {...S} />
      <rect x="12" y="44" width="76" height="46" rx="4" fill="#a0632e" {...S} />
      <path d="M12 44 h76 M30 44 v46 M70 44 v46" stroke="#f2b33d" strokeWidth={5} />
    </g>
  ),
  leaf: () => (
    <g>
      <path d="M16 84 q-4 -60 70 -70 q4 70 -70 70z" fill="#8fce7a" {...S} />
      <path d="M16 84 q30 -30 56 -58" {...S} fill="none" />
    </g>
  ),
  rainbowHand: () => (
    <g>
      <path d="M14 86 q0 -64 36 -64 q36 0 36 64" fill="none" stroke="#e25b5b" strokeWidth={6} strokeLinecap="round" />
      <path d="M24 86 q0 -52 26 -52 q26 0 26 52" fill="none" stroke="#f2b33d" strokeWidth={6} strokeLinecap="round" />
      <path d="M34 86 q0 -40 16 -40 q16 0 16 40" fill="none" stroke="#7cc46a" strokeWidth={6} strokeLinecap="round" />
      <path d="M44 86 q0 -28 6 -28 q6 0 6 28" fill="none" stroke="#5aa9e6" strokeWidth={6} strokeLinecap="round" />
    </g>
  ),
  armBounce: () => (
    <g>
      <rect x="8" y="78" width="84" height="18" rx="3" fill="#fff" {...S} />
      <path d="M36 78 v18 M64 78 v18" stroke={INK} strokeWidth={2} />
      <path d="M14 70 q12 -40 24 0 q12 -40 24 0 q12 -40 24 0" fill="none" stroke="#5aa9e6" strokeWidth={4} strokeLinecap="round" strokeDasharray="1 7" />
      <circle cx="50" cy="30" r="14" fill="#f5c9a3" {...S} />
      <path d="M40 40 v8 M46 42 v8 M54 42 v8 M60 40 v8" {...S} stroke="#e0a97c" strokeWidth={3} />
      <path d="M26 12 q6 -6 12 0 M62 12 q6 -6 12 0" fill="none" {...S} stroke="#f2b33d" />
    </g>
  ),
  feather: () => (
    <g>
      <path d="M20 90 q10 -70 70 -80 q-10 60 -70 80z" fill="#d9f1ff" {...S} />
      <path d="M20 90 q30 -40 60 -72" {...S} fill="none" />
    </g>
  ),
  drum: () => (
    <g>
      <ellipse cx="50" cy="40" rx="36" ry="12" fill="#f5e0c3" {...S} />
      <path d="M14 40 v36 q36 22 72 0 v-36" fill="#e25b5b" {...S} />
      <path d="M14 48 l18 30 l18 -30 l18 30 l18 -30" stroke="#f2b33d" strokeWidth={3} fill="none" />
      <path d="M30 10 l16 24 M74 8 l-16 26" {...S} strokeWidth={4} />
    </g>
  ),
  eyes: () => (
    <g>
      <ellipse cx="30" cy="50" rx="20" ry="16" fill="#fff" {...S} />
      <ellipse cx="70" cy="50" rx="20" ry="16" fill="#fff" {...S} />
      <circle cx="30" cy="54" r="8" fill="#5aa9e6" />
      <circle cx="70" cy="54" r="8" fill="#5aa9e6" />
      <circle cx="30" cy="54" r="4" fill={INK} />
      <circle cx="70" cy="54" r="4" fill={INK} />
    </g>
  ),
  eyesClosed: () => (
    <g fill="none" {...S} strokeWidth={4}>
      <path d="M12 50 q18 16 36 0 M52 50 q18 16 36 0" />
      <path d="M18 58 l-4 6 M30 62 v7 M42 58 l4 6 M58 58 l-4 6 M70 62 v7 M82 58 l4 6" strokeWidth={2.5} />
    </g>
  ),
  ear: () => (
    <g>
      <path d="M30 40 q0 -30 28 -30 q28 0 26 30 q-2 20 -20 30 q-10 6 -10 18 q-2 10 -14 8" fill="#f5c9a3" {...S} />
      <path d="M44 40 q0 -16 14 -16 q14 0 12 16 q-2 8 -10 12" fill="none" {...S} />
      <path d="M8 36 q-6 14 0 28 M16 42 q-4 8 0 16" fill="none" {...S} stroke="#5aa9e6" />
    </g>
  ),
  thumb: () => (
    <g>
      <path d="M30 94 v-44 q0 -8 8 -8 h4 v-24 q0 -10 10 -10 q10 0 10 10 v24 h14 q10 0 10 10 v42z" fill="#f5c9a3" {...S} />
      <path d="M52 12 q6 0 8 4" fill="none" stroke="#f7b9c4" strokeWidth={3} />
    </g>
  ),
  count: () => (
    <g fontFamily="ui-rounded, system-ui, sans-serif" fontWeight={800} fontSize={36} textAnchor="middle">
      <text x="20" y="66" fill="#e25b5b" stroke={INK} strokeWidth={1.5}>1</text>
      <text x="50" y="66" fill="#f2b33d" stroke={INK} strokeWidth={1.5}>2</text>
      <text x="80" y="66" fill="#5aa9e6" stroke={INK} strokeWidth={1.5}>3</text>
    </g>
  ),
  teacher: () => (
    <g>
      <circle cx="30" cy="32" r="14" fill="#f5c9a3" {...S} />
      <path d="M10 94 q0 -40 20 -40 q20 0 20 40z" fill="#5aa9e6" {...S} />
      <circle cx="72" cy="46" r="11" fill="#f5c9a3" {...S} />
      <path d="M56 94 q0 -32 16 -32 q16 0 16 32z" fill="#f2b33d" {...S} />
      <path d="M62 38 h20 l-10 -8z" fill={INK} />
      <path d="M86 40 l6 -24" {...S} stroke="#8d6e4c" strokeWidth={3} />
    </g>
  ),
  question: () => (
    <g>
      <circle cx="50" cy="50" r="40" fill="#b39ddb" {...S} />
      <path d="M38 38 q0 -16 14 -16 q14 0 14 12 q0 10 -12 14 v8" fill="none" {...S} stroke="#fff" strokeWidth={7} />
      <circle cx="54" cy="74" r="5" fill="#fff" />
    </g>
  ),
  statue: () => (
    <g>
      <rect x="22" y="80" width="56" height="16" rx="2" fill="#bdbdbd" {...S} />
      <circle cx="50" cy="22" r="12" fill="#e0e0e0" {...S} />
      <path d="M36 80 v-30 q0 -14 14 -14 q14 0 14 14 v30z" fill="#e0e0e0" {...S} />
      <path d="M36 44 l-16 -16 M64 44 l16 -16" {...S} stroke="#9e9e9e" strokeWidth={6} />
    </g>
  ),
  crown: () => (
    <g>
      <path d="M12 76 l-2 -48 l22 22 l18 -32 l18 32 l22 -22 l-2 48z" fill="#f7cf4a" {...S} />
      <circle cx="50" cy="60" r="6" fill="#e25b5b" {...S} />
      <circle cx="28" cy="64" r="4" fill="#5aa9e6" {...S} />
      <circle cx="72" cy="64" r="4" fill="#7cc46a" {...S} />
    </g>
  ),
  rocket: () => (
    <g>
      <path d="M50 6 q22 18 18 60 h-36 q-4 -42 18 -60z" fill="#eceff1" {...S} />
      <circle cx="50" cy="38" r="8" fill="#5aa9e6" {...S} />
      <path d="M32 50 l-14 22 h14z M68 50 l14 22 h-14z" fill="#e25b5b" {...S} />
      <path d="M40 68 q10 30 20 0z" fill="#f2b33d" {...S} />
    </g>
  ),
  stage: () => (
    <g>
      <rect x="4" y="76" width="92" height="18" fill="#a0632e" {...S} />
      <path d="M4 6 h92 v10 q-46 12 -92 0z" fill="#c62828" {...S} />
      <path d="M4 16 q20 30 6 60 h-6z M96 16 q-20 30 -6 60 h6z" fill="#e53935" {...S} />
      <circle cx="50" cy="44" r="10" fill="#f7cf4a" opacity={0.7} />
      <path d="M50 54 v20" {...S} />
    </g>
  ),
  gamepad: () => (
    <g>
      <path d="M20 36 h60 q16 0 16 22 q0 26 -16 26 q-8 0 -14 -12 h-32 q-6 12 -14 12 q-16 0 -16 -26 q0 -22 16 -22z" fill="#7e57c2" {...S} />
      <path d="M26 52 h14 M33 45 v14" stroke="#fff" strokeWidth={5} strokeLinecap="round" />
      <circle cx="66" cy="50" r="4" fill="#f2b33d" />
      <circle cx="76" cy="58" r="4" fill="#7cc46a" />
    </g>
  ),
  candy: () => (
    <g>
      <path d="M26 50 l-18 -14 v28z M74 50 l18 -14 v28z" fill="#f7a8c8" {...S} />
      <circle cx="50" cy="50" r="24" fill="#e25b5b" {...S} />
      <path d="M36 38 q14 14 0 26 M52 28 q14 22 0 44" stroke="#fff" strokeWidth={4} fill="none" />
    </g>
  ),
  tv: () => (
    <g>
      <path d="M36 14 l14 14 l14 -14" {...S} fill="none" />
      <rect x="10" y="28" width="80" height="58" rx="8" fill="#4a3b52" {...S} />
      <rect x="18" y="36" width="64" height="42" rx="4" fill="#9bd4f5" />
      <circle cx="50" cy="57" r="10" fill="#f7cf4a" />
    </g>
  ),
  balloon: () => (
    <g>
      <ellipse cx="50" cy="40" rx="30" ry="34" fill="#f7a8c8" {...S} />
      <path d="M46 74 h8 l-4 6z" fill="#f7a8c8" {...S} />
      <path d="M50 80 q-8 8 0 18" {...S} fill="none" />
      <ellipse cx="38" cy="28" rx="6" ry="10" fill="#fff" opacity={0.6} />
    </g>
  ),
  squishy: () => (
    <g>
      <path d="M14 64 q-4 -40 36 -40 q40 0 36 40 q-2 24 -36 24 q-34 0 -36 -24z" fill="#b2ebf2" {...S} />
      <Eyes x1={40} x2={60} y={52} />
      <Smile x={50} y={62} w={10} />
    </g>
  ),
  sparkle: () => (
    <path d="M50 4 q6 40 46 46 q-40 6 -46 46 q-6 -40 -46 -46 q40 -6 46 -46z" fill="#f7cf4a" {...S} strokeWidth={2} />
  ),
  wiggle: () => (
    <g fill="none" {...S} strokeWidth={5} stroke="#7cc46a">
      <path d="M10 30 q10 -12 20 0 t20 0 t20 0 t20 0" />
      <path d="M10 55 q10 -12 20 0 t20 0 t20 0 t20 0" stroke="#5aa9e6" />
      <path d="M10 80 q10 -12 20 0 t20 0 t20 0 t20 0" stroke="#f2b33d" />
    </g>
  ),
}

export function artNames() {
  return Object.keys(drawings)
}

/** A drawing as a <g>, sized into a box of `size` at (x,y) with feet at y. For use inside scenes. */
export function ArtG({ name, x, y, size, flip, sleepy }: { name: string; x: number; y: number; size: number; flip?: boolean; sleepy?: boolean }) {
  const buddy = useContext(BuddyContext)
  const key = name === 'buddy' ? buddy : name
  const draw = drawings[key]
  if (!draw) return null
  const k = size / 100
  const tx = x - size / 2
  const ty = y - size
  const flipT = flip ? `translate(100 0) scale(-1 1)` : ''
  return (
    <g transform={`translate(${tx} ${ty}) scale(${k})`}>
      <g transform={flipT}>{draw({ sleepy })}</g>
    </g>
  )
}

/** A standalone drawing. */
export function Art({ name, className, sleepy, flip, title }: { name: string; className?: string; sleepy?: boolean; flip?: boolean; title?: string }) {
  const buddy = useContext(BuddyContext)
  const key = name === 'buddy' ? buddy : name
  const draw = drawings[key]
  return (
    <svg viewBox="-4 -4 108 108" className={className} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      {draw ? <g transform={flip ? 'translate(100 0) scale(-1 1)' : undefined}>{draw({ sleepy })}</g> : null}
    </svg>
  )
}
