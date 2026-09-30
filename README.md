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
- **Tokens.** 1 per rep, plus bonuses:
  - +1 if the first note comes within 2 minutes of Start.
  - +2 for finishing the planned session.
  - +2 for coming back from Reset.

  Nothing is ever taken away. Tokens only go down when he trades them for a reward.
- **Stories.** Each rep unlocks the next page of an illustrated episode, read aloud with word highlighting where the voice supports it. There are 3 episodes, each ending on a cliffhanger.
- **Reset mode.** A calm screen with no tokens visible. He picks the balloon (6 breaths) or the squishy (6 squeezes), with dots showing the break has an end. Next comes "just one note", which counts as a rep and earns the comeback bonus. The session then resumes at a smaller chunk, or goes straight to Treasure. The parent sees coaching lines throughout.
- **Treasure.** He trades tokens for rewards:
  - 1 token = 1 minute of iPad game (daily cap of 30 screen minutes)
  - 5 tokens = a small candy
  - 8 tokens = a show episode

  On school-day mornings, screen-time rewards are held until 3 pm ("waiting for after school").
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

Changes apply from the next session. During a session, a picture path at the bottom shows every stop, where you are, and one note per mission that fills in as he goes.

## Changing content

Everything the child sees or hears lives in JSON under `src/content/`, so you can edit it without touching components:

| File | What it holds |
| --- | --- |
| `weekPlan.json` | Default week plan (Grown-up settings overrides it): warm-up, focus chunk (label, goal, full/half/tiny descriptions), concert, and **reps per chunk (5)** |
| `repCards.json` | The 20 mission cards |
| `specialCards.json` | Warm-up, concert and "just one note" lines |
| `goals.json` | Chunk goals, their spoken reminders and praise lines |
| `stories.json` | Episodes: 7 pages each (intro after warm-up, one per focus rep, finale at Treasure) plus a cliffhanger. `{child}` and `{buddy}` are filled in. |
| `rewards.json` | Reward menu, token costs, screen-time cap, school days and after-school hour |
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
