# Piano Missions (Adler's piano practice app)

An iPad web app that turns a short morning practice into missions, stories and treasure. It never asks for "again": every rep is a new mission. Built from the *Adler's Piano Practice App — Build Spec*.

**Status: Milestone 1 (the rep loop).** Parent mode, logging views and theory games come in M2 and M3.

## What M1 does

A Short session runs five stops on a path the child can see: **Warm-up win → Focus chunk (5 reps) → Wiggle break → Concert → Treasure**.

- **Rep Cards.** Before each focus rep he picks one of two illustrated missions (sleepy mouse, play for the bear, and so on). The buddy reads the mission and the chunk's goal aloud. There are 20 cards, with no repeats in a session and the "grown-up goes first" card at most once per chunk.
- **Parent strip** (bottom of the screen):
  - **Got the goal** / **Tried it**: both pay the same.
  - **Shrink**: full → half → tiny, with no signal to the child.
  - **Leaf**: starts Reset mode.
  - **•••**: skip this stop, or finish for today.
  - It also shows a ready-made praise line for the goal.
- **Notes (tokens).** 1 per rep, plus bonuses:
  - +1 if the first note comes within 2 minutes of Start.
  - +2 for finishing the planned session.
  - +2 for coming back from Reset.

  Nothing is ever taken away.
- **Stories.** Each rep unlocks the next page of an illustrated episode, read aloud with word highlighting where the voice supports it. There are 3 episodes, each ending on a cliffhanger.
- **Reset mode.** A calm screen with no tokens visible. He picks the balloon (6 breaths) or the squishy (6 squeezes), with dots showing the break has an end. Next comes "just one note", which counts as a rep and earns the comeback bonus. The session then resumes at a smaller chunk, or goes straight to Treasure. The parent sees coaching lines throughout.
- **Treasure: one prize a day.** A perfect practice fills the prize (10 of 10 notes in a Short session) and earns **30 minutes**. A partial practice earns its share; for example, 6 of 10 notes earns 18 minutes. He sees the prize as a pie filling up. Then he makes **one pick**:
  - **A show** or **an iPad game**, for the minutes he earned.
  - **A small candy instead of screen time** (uses 15 minutes; the rest go to the weekend bank).
  - **Save it for the weekend** (the piggy bank).

  On Saturday and Sunday, the weekend bank adds to that day's prize (up to 60 minutes). The bank starts empty each Monday. On school-day mornings, screen time waits until 3 pm. You can change all of these numbers in `src/content/rewards.json`.
- **Session log.** Every session saves reps per stop, resets, time to first note, how it ended and a rough/OK/good rating. It all stays on the iPad, for M2's charts.
- Offline, installable to the Home Screen, and a closed app resumes where it left off.

## This week's plan

After each lesson, open **Grown-up settings → This week** on the home screen. There you set:
- the focus chunk's name
- its goal: pick one (arm bounce, rainbow hand, soft sound…) or type your own
- missions per chunk (default 5)
- what each Shrink size means
- the warm-up and concert pieces
- lesson notes

Changes apply from the next session. **Grown-up settings → Reset** can start the stories over, clear prizes and the weekend bank, clear practice history (useful after testing), or erase everything. During a session, a picture path at the bottom shows every stop, where you are, and one note per mission that fills in as he goes.

## Changing content

Everything the child sees or hears lives in JSON under `src/content/`, so you can edit it without touching components:

| File | What it holds |
| --- | --- |
| `weekPlan.json` | Default week plan (Grown-up settings overrides it): warm-up, focus chunk (label, goal, full/half/tiny descriptions), concert, and **reps per chunk (5)** |
| `repCards.json` | The 20 mission cards |
| `specialCards.json` | Warm-up, concert and "just one note" lines |
| `goals.json` | Chunk goals, their spoken reminders and praise lines |
| `stories.json` | Episodes: 7 pages each (intro after warm-up, one per focus rep, finale at Treasure) plus a cliffhanger. `{child}` and `{buddy}` are filled in. |
| `rewards.json` | Full-prize minutes, candy cost, weekend bank cap, the prize choices, school days and after-school hour |
| `lines.json` | Everything the buddy says |
| `resetScripts.json` | Parent coaching lines in Reset mode |
| `pieces.json` | Suzuki Book 1 list and statuses |

Content must never say "again". A test enforces this.

## Develop

```bash
npm install
npm run dev        # http://localhost:5173 (also on your LAN via --host)
npm test           # session rules and content checks
npm run build      # typecheck + production build in dist/
```

## Put it on the iPad

The app has to be served over HTTPS to install and work offline. The easiest option is **Vercel**:

1. Go to vercel.com → Add New → Project → import `aug-erica/adler`.
2. Vite is auto-detected, so click Deploy.
3. On the iPad, open the URL in **Safari** → Share → **Add to Home Screen**.

After the first launch it works offline.

First run: let Adler pick the buddy animal and name it. Then tap the buddy on the home screen to hear it say hi. Tapping also unlocks speech on iPad.

Tip: in iPad Settings → Accessibility → Spoken Content → Voices → English, download an "Enhanced" or "Premium" voice (for example Samantha or Ava). The app picks the warmest one installed. You can change the voice speed in Grown-up settings.
