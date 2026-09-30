import { useState } from 'react'
import { MotionConfig } from 'framer-motion'
import { BuddyContext } from './components/art/Art'
import { useApp } from './lib/useApp'
import { HomeScreen } from './screens/HomeScreen'
import { SessionView } from './screens/SessionView'
import { SetupScreen } from './screens/SetupScreen'
import { GrownUpScreen } from './screens/GrownUpScreen'

export default function App() {
  const app = useApp()
  const [editing, setEditing] = useState(false)

  if (!app.loaded) return null

  let body
  if (!app.child) {
    body = <SetupScreen initial={null} onSave={(c) => void app.setChild(c)} />
  } else if (editing) {
    body = (
      <GrownUpScreen
        child={app.child}
        onSaveChild={(c) => void app.setChild(c)}
        onSaveWeek={app.saveWeekPlan}
        onClose={() => setEditing(false)}
      />
    )
  } else if (app.session) {
    body = (
      <SessionView
        s={app.session}
        child={app.child}
        sessionTokens={app.sessionTokens}
        dispatch={app.dispatch}
      />
    )
  } else {
    body = <HomeScreen child={app.child} bank={app.bank} onStart={() => void app.start()} onSettings={() => setEditing(true)} />
  }

  return (
    <MotionConfig reducedMotion="user">
      <BuddyContext.Provider value={app.child?.buddyAnimal ?? 'fox'}>
        <main className="h-dvh w-full overflow-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">{body}</main>
      </BuddyContext.Provider>
    </MotionConfig>
  )
}
