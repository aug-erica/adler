import { useState } from 'react'
import { MotionConfig } from 'framer-motion'
import { BuddyContext } from './components/art/Art'
import { useApp } from './lib/useApp'
import { HomeScreen } from './screens/HomeScreen'
import { SessionView } from './screens/SessionView'
import { SetupScreen } from './screens/SetupScreen'

export default function App() {
  const app = useApp()
  const [editing, setEditing] = useState(false)

  if (!app.loaded) return null

  let body
  if (!app.child || editing) {
    body = (
      <SetupScreen
        initial={app.child}
        onCancel={app.child ? () => setEditing(false) : undefined}
        onSave={(c) => {
          void app.setChild(c)
          setEditing(false)
        }}
      />
    )
  } else if (app.session) {
    body = (
      <SessionView
        s={app.session}
        child={app.child}
        balance={app.balance}
        sessionTokens={app.sessionTokens}
        dispatch={app.dispatch}
      />
    )
  } else {
    body = <HomeScreen child={app.child} balance={app.balance} onStart={() => void app.start()} onSettings={() => setEditing(true)} />
  }

  return (
    <MotionConfig reducedMotion="user">
      <BuddyContext.Provider value={app.child?.buddyAnimal ?? 'fox'}>
        <main className="h-dvh w-full overflow-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">{body}</main>
      </BuddyContext.Provider>
    </MotionConfig>
  )
}
