import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LeafButton, ParentButton, ParentStrip, TokenCounter } from '../components/ui'
import { SessionProgress } from '../components/SessionProgress'
import { chunkById, getWeekPlan, goalForChunk, resetScripts, storyById } from '../lib/content'
import { chunkSizeLabel, currentStop, repsLabel, type Action } from '../lib/session'
import type { Child, SessionState } from '../lib/types'
import { BreakScreen } from './BreakScreen'
import { CelebrateScreen } from './CelebrateScreen'
import { MapScreen, STOP_NAMES } from './MapScreen'
import { CardScreen, ChooseScreen } from './MissionScreens'
import { ResetScreen } from './ResetScreen'
import { StoryPageView } from './StoryScreen'
import { TreasureScreen } from './TreasureScreen'

export function SessionView({ s, child, balance, sessionTokens, dispatch }: {
  s: SessionState
  child: Child
  balance: number
  sessionTokens: number
  dispatch: (a: Action) => void
}) {
  const act = useCallback((a: Action) => () => dispatch(a), [dispatch])
  const onActivityEnd = useCallback(() => dispatch({ type: 'resetActivityEnd' }), [dispatch])
  const onWelcomeEnd = useCallback(() => dispatch({ type: 'resetWelcomeEnd' }), [dispatch])

  if (s.phase === 'treasure') {
    return (
      <TreasureScreen
        s={s}
        child={child}
        balance={balance}
        sessionTokens={sessionTokens}
        onEnd={(rating) => dispatch({ type: 'end', rating })}
      />
    )
  }

  const story = storyById(s.storyId)
  const showTokens = s.phase !== 'reset'

  return (
    <div className="flex h-full flex-col">
      <div className="relative min-h-0 flex-1">
        {showTokens && (
          <div className="absolute top-4 right-4 z-10">
            <TokenCounter count={sessionTokens} />
          </div>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${s.phase}-${s.stopIndex}-${s.resetStage ?? ''}`}
            className="h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {s.phase === 'map' && (
              <MapScreen s={s} onEnter={act({ type: 'enterStop' })} onToggle={(id) => dispatch({ type: 'toggleStop', stopId: id })} />
            )}
            {s.phase === 'choose' && <ChooseScreen s={s} child={child} onPick={(id) => dispatch({ type: 'pickCard', cardId: id })} />}
            {s.phase === 'card' && <CardScreen s={s} child={child} />}
            {s.phase === 'celebrate' && (
              <CelebrateScreen amount={s.lastCelebration?.amount ?? 1} onDone={act({ type: 'celebrateEnd' })} />
            )}
            {s.phase === 'story' && story.pages[s.storyPage] && (
              <StoryPageView
                page={story.pages[s.storyPage]}
                child={child}
                pageKey={`${s.id}-${s.storyPage}`}
                onNext={act({ type: 'storyNext' })}
              />
            )}
            {s.phase === 'break' && <BreakScreen onDone={act({ type: 'breakEnd' })} />}
            {s.phase === 'reset' && (
              <ResetScreen
                s={s}
                child={child}
                onChoose={(a) => dispatch({ type: 'resetChoose', activity: a })}
                onActivityEnd={onActivityEnd}
                onWelcomeEnd={onWelcomeEnd}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      {s.phase !== 'map' && s.phase !== 'reset' && <SessionProgress s={s} />}
      <SessionParentStrip s={s} dispatch={dispatch} />
    </div>
  )
}

function SessionParentStrip({ s, dispatch }: { s: SessionState; dispatch: (a: Action) => void }) {
  const [menu, setMenu] = useState(false)
  const stop = currentStop(s)
  const chunk = chunkById(stop.chunkId)
  const goal = goalForChunk(chunk)
  const praise = goal ? goal.praiseLines[stop.repsDone % goal.praiseLines.length] : null
  const repStop = stop.type === 'warmup' || stop.type === 'focus' || stop.type === 'concert'

  if (s.phase === 'reset') {
    const returning = s.resetStage === 'return'
    return (
      <ParentStrip>
        <ul className="flex-1 list-disc space-y-0.5 pl-5 text-[0.95rem]">
          {resetScripts.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
        {returning ? (
          <>
            <span className="max-w-40 text-xs">He plays one note (or 3). Any try counts.</span>
            <ParentButton variant="primary" onClick={() => dispatch({ type: 'repDone', rating: 'tried' })}>
              ✓ He did it
            </ParentButton>
          </>
        ) : (
          s.resetStage !== 'welcome' && (
            <ParentButton onClick={() => dispatch({ type: 'resetActivityEnd' })}>Skip to one note</ParentButton>
          )
        )}
        {s.resetStage !== 'welcome' && (
          <ParentButton variant="quiet" onClick={() => dispatch({ type: 'finishToday' })}>
            Finish for today
          </ParentButton>
        )}
      </ParentStrip>
    )
  }

  return (
    <ParentStrip>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="font-semibold text-ink">
          {stop.type === 'focus' && chunk ? chunk.label : STOP_NAMES[stop.type]}
          {repStop && stop.targetReps > 1 && ` · ${repsLabel(stop)}`}
          {stop.type === 'focus' && chunk && ` · ${chunkSizeLabel(stop)}`}
          {s.phase === 'map' && !s.started && ' · tap “Skip” under a stop to drop it'}
        </div>
        {stop.type === 'focus' && goal && (
          <div className="truncate">
            Goal: {goal.label}
            {praise && s.phase === 'card' && <> · Say: “{praise}”</>}
          </div>
        )}
        {stop.type === 'warmup' && <div>Piece: {getWeekPlan().warmup.label}. Frame it as a superpower, not review.</div>}
        {stop.type === 'concert' && <div>Piece: {getWeekPlan().concert.label}. One time through; you're the audience.</div>}
      </div>

      {s.phase === 'card' && (
        <>
          <ParentButton variant="primary" onClick={() => dispatch({ type: 'repDone', rating: 'goal' })}>
            ✓ Got the goal
          </ParentButton>
          <ParentButton variant="primary" className="bg-sun!" onClick={() => dispatch({ type: 'repDone', rating: 'tried' })}>
            Tried it
          </ParentButton>
        </>
      )}
      {stop.type === 'focus' && (s.phase === 'card' || s.phase === 'choose') && stop.size !== 'tiny' && (
        <ParentButton onClick={() => dispatch({ type: 'shrink' })}>Shrink</ParentButton>
      )}
      <LeafButton onClick={() => dispatch({ type: 'resetStart' })} />
      <div className="relative">
        <ParentButton variant="quiet" label="More" onClick={() => setMenu((m) => !m)}>
          •••
        </ParentButton>
        {menu && (
          <div className="absolute right-0 bottom-16 z-20 flex w-56 flex-col gap-2 rounded-2xl border-2 border-ink/20 bg-white p-3 shadow-xl">
            <ParentButton
              onClick={() => {
                setMenu(false)
                dispatch({ type: 'skipStop' })
              }}
            >
              Skip this stop
            </ParentButton>
            <ParentButton
              onClick={() => {
                setMenu(false)
                dispatch({ type: 'finishToday' })
              }}
            >
              Finish for today
            </ParentButton>
          </div>
        )}
      </div>
    </ParentStrip>
  )
}
