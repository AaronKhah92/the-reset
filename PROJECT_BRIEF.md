# The Reset v2 — Project Brief

## 1. What this is

A personal, phone-first habit app themed on Guild Wars 2's systems: a tiny daily input (three taps) that a dozen interconnected systems all react to — levels, quest chapters, dailies, collections, achievements, a growing home base. The whole design philosophy: **what you do stays tiny, what you see react gets to be huge.**

v1 was a single self-contained HTML file, built and tuned over real use. It worked. This v2 is a full rebuild in a real toolchain (Vite + React + TypeScript) so it can go further visually and interactively than a single file reasonably could — while keeping the exact same soul. Read `.windsurfrules` for stack/conventions; this doc is the feature and design spec.

## 2. Design direction

**Evolve v1's palette, don't discard it.** It already avoided the generic "dark mode + one accent" trap by giving each system its own color meaning. Keep the semantics, push the execution further.

**Palette** (CSS custom properties, semantic — don't let cosmetic themes override these core meanings, only the ambient "glow" accent):
- `--void: #0A0C16` / `--obsidian: #151830` — background layers
- `--gold: #E7B155` — level, XP, Discipline currency
- `--teal: #34D9C4` — Main Quest thread
- `--violet: #9D7CFF` — Side Quest / Presence
- `--moonlight: #EDEAF6` — primary text
- **New: rarity tiers** for achievements/rewards — Common `#8D8FB0` (fog grey), Rare `#34D9C4` (teal), Epic `#9D7CFF` (violet), Legendary `#E7B155` with an animated shimmer sweep. Gives unlocks a real loot-game feel: not everything is worth the same amount of celebration.

**Type**: Cinzel (display — quest titles, level-up numbers, chapter headers), Manrope (UI/body), JetBrains Mono (all numeric HUD readouts — XP counts, stat values, streak numbers). Consider gradient-fill text (gold→teal or gold→violet) on the biggest moments — level-up number, legendary unlock — as a one-time-per-moment flourish, not a standing style.

**Signature element — upgrade this the most.** v1's home base was a static-ish SVG horizon that grew with level. For v2, unify it with the achievements/collections screen into one continuous scene: **the Home Base beacon sits at the bottom of an explorable night sky, and every achievement + collection is a star in that same sky.** Locked ones are dim unlit outlines; unlocked ones glow, colored by rarity tier, connected by faint constellation lines to related unlocks (all Discipline-themed achievements form one cluster, all Presence-themed form another). The Home tab shows the bottom slice near the beacon; the Codex tab is the same canvas, pannable/zoomable, to see the whole sky. One scene, two windows into it — the character's whole progress becomes one literal sky they're filling in.

**Motion language**: spring physics throughout (buttons squash slightly on press, bars overshoot-then-settle when filling, cards have a touch of weight when dragged) via the `motion` package. Reserve the biggest motion — confetti bursts, screen-filling glow — for level-ups and Legendary unlocks specifically, so it still means something. Subtle ambient motion is fine everywhere (slow-drifting background embers/stars at low opacity), but keep it cheap (transform/opacity only, GPU-friendly) since this needs to run smoothly on a phone.

## 3. Core loop (protected — see `.windsurfrules`)

Three tap targets, unchanged in spirit from v1:
1. **Stayed in the window** — "Ate within your eating window today"
2. **Clean day** — "Skipped the late-night pattern"
3. **Present with the kids** — "Read, played, or put the phone down"

Weight logging exists but stays a quiet optional field elsewhere — never part of this core three.

## 4. Proven data model (port this, don't reinvent)

This is the exact shape and content that was built and tested in v1. Bring it over as-is; only the presentation layer needs to be new.

```typescript
export interface DayCheckins {
  window: boolean;
  cleanDay: boolean;
  kids: boolean;
}

export interface WeightEntry { date: string; weight: number; }

export interface CustomQuest {
  name: string | null;
  checkins: Record<string, boolean>; // date -> true
}

export interface AppState {
  version: number;
  startedAt: string;                 // ISO date, app first-open
  totalXP: number;
  currencies: { discipline: number; presence: number };
  checkins: Record<string, DayCheckins>;   // SOURCE OF TRUTH — date -> checks
  weightLog: WeightEntry[];
  customQuest: CustomQuest;
  equippedTheme: string;
  unlockedThemes: string[];
  equippedTitle: string | null;
  purchasedFlourishes: string[];
  monthlyThresholdsGranted: Record<string, number[]>; // 'YYYY-MM' -> [5, 15]
  lastBossMonthProcessed: string | null;   // 'YYYY-MM'
  hasSeenIntro: boolean;
}
```

**XP curve** — level `n` → `n+1` costs `80 + (n-1) * 30` XP. Recompute level from cumulative `totalXP` on every render (cheap loop, don't store level redundantly).

**Per check-in XP**: `15 + min(currentStreakAfterThisCheck, 10)`, plus a `+10` "first check of the day" bonus. Currency: window/cleanDay checks grant +2 Discipline, kids checks grant +2 Presence.

**Streak math**: for a given check type, walk the sorted dates where that type is true; consecutive calendar days (diff of 1) extend the streak, a gap resets it — but only once "today" has actually passed without a check. If today isn't checked yet, still count backward from yesterday (a streak isn't dead just because today hasn't happened yet).

**Main Quest — "The Reset"** (progress = cumulative window + cleanDay checks):
| Threshold | Chapter |
|---|---|
| 0 | Breaking the Loop — "Every reset starts with noticing the loop. You're here. That's the whole first move." |
| 10 | First Cracks of Light — "Ten times you chose the window or the clean day over the old pattern. The loop isn't broken yet — but it's cracked." |
| 30 | Building the New Normal — "This is the part where it stops being a diet and starts being just... what you do." |
| 70 | The Long Stretch — "The exciting part is over and the durable part has started. That's not a downgrade. That's the goal." |
| 140 | Old Ghosts — "Some days the old pattern is going to win. That's not the story ending. That's just a chapter with a rough patch in it." |
| 250 | Who You're Becoming — "Less a version of yourself trying to lose weight. More just a version of yourself who eats like this now." |
| 400 | The Reset, Continued — "There's no final boss here. Just Tuesday, then Wednesday, then the next one." |

**Side Quest — Kids Presence** (unlocks at Character Level 5, progress = cumulative kids checks):
| Threshold | Chapter |
|---|---|
| 0 | Showing Up — "Being there and being present aren't the same thing. This tracks the second one." |
| 10 | In the Room — "Ten times you put the phone down first. They noticed, even if they didn't say it." |
| 30 | All In — "This isn't about being a perfect parent. It's about being one who's there for the moments that actually happen." |
| 70 | The Best Part of the Day — "Eventually this stops being a task on a list and starts being the part of the day you look forward to." |

**Achievements** (id / name / rarity / condition):
- `first_step` First Step · Common · first ever check-in
- `full_house` Full House · Common · all 3 checks in one day, first time
- `founder` Founder · Common · name a custom quest
- `week_one` Week One · Rare · 7-day streak on any single track
- `showing_up_them` Showing Up For Them · Rare · 10 cumulative kids checks
- `collector` Collector · Rare · complete first Collection
- `comeback` The Comeback (title: "The Returner") · Epic · check in again after a 3+ day gap — no shame, just showing up
- `full_calendar` Full Calendar · Epic · stamp every day of a calendar month
- `old_ghosts` Old Ghosts · Epic · reach Main Quest Chapter 5
- `apprentice` Apprentice (title: "the Apprentice") · Epic · reach Level 5
- `adept` Adept (title: "the Adept") · Epic · reach Level 10
- `veteran` Veteran (title: "the Veteran") · Legendary · reach Level 20
- `champion` Champion (title: "the Champion") · Legendary · reach Level 30
- `one_season` One Season · Legendary · 90 days since start

**Collections** (cumulative count → cosmetic theme reward):
- Evening Calm — 7 cleanDay checks → **Frost** theme
- Morning Light — 7 window checks → **Verdant** theme
- Family Time — 10 kids checks → **Twilight** theme
- Full Moon — every day of one calendar month stamped → **Aurora** theme (animated, rarest)

**Calendar dailies**: cumulative (not consecutive) stamps per month; bonus currency at 5 and 15 stamps, tracked per-month so it doesn't re-grant. Missing days never penalize anything.

**Monthly Boss Fight**: on first load of a new month, if the previous month had any activity, show a recap ("Monthly Reckoning") and grant `max(20, prevMonthStampCount * 3)` currency, split between Discipline/Presence. Always positive framing — there's no "you lost" state.

## 5. Systems carried over from v1 (rebuild these first, they're the game)

Character Level (master XP bar) · Main Quest chapters · Side Quests (Kids-Presence + one open custom-quest slot) · Dailies/Login Calendar · Two currencies spendable in a small cosmetic shop · Achievements & equippable Titles · Collections that unlock color themes · Character Sheet with four derived stats (Discipline, Vitality, Presence, Focus — each from a genuinely different formula, not four copies of the same number) · Home Base scene that visibly grows with level · Monthly Boss Fight recap.

## 6. New feature ideas (brainstorm — pick freely, tagged by effort)

### Visual & sensory polish — **core, do these**
- Rarity-tiered unlock celebrations (§2) — bigger confetti/glow for Epic and Legendary
- Ambient particle background (slow-drifting embers or stars, very low opacity, always on)
- Home Base ↔ Codex constellation unification (§2's signature element)
- Spring-physics micro-interactions on every button/card/bar via `motion`
- Optional haptic buzz on check-in / level-up via the Vibration API (mobile only, guard for support)
- Swipe/drag-to-confirm gesture on the 3 check cards instead of (or alongside) tap — `motion`'s drag gestures make this straightforward and it's a much more satisfying phone interaction than a flat tap

### Deeper RPG systems — **core, do these**
- **Perk tree**: spend a level-up point on small permanent flavor perks (cosmetic slots, extra encouragement copy, etc.) — a branching node UI, visually distinctive and satisfying to interact with
- **Avatar sigil**: pick a small emblem/color mark from unlocked options, shown on the Character sheet — lightweight personalization
- **Companion**: a small creature/spirit on the Home Base scene that visually evolves at the same level tiers as the camp (egg → hatchling → grown → radiant, or your own theme). Never punished for gaps — it just doesn't grow yet. Pure warmth, zero pressure.

### Time-based variety — **core, do these**
- **Daily Trial**: one small optional bonus objective per day (e.g. "log the kids check before 7pm for +5 XP") — never required, pure upside, adds variety without adding obligation
- 2–3 **hidden/secret achievements** not shown until unlocked, for surprise-delight (keep them lighthearted, not obscure or frustrating — e.g. "checked in before 7am five times")

### Reflection tools — **core, do these, keep them optional**
- **Journal**: an optional one-line note attachable to any day, purely for the user, never analyzed or surfaced anywhere else
- **Gentle insights**: light pattern-noticing computed client-side from the checkins log only (e.g. "you're most consistent on weekdays") — behavioral patterns only, never anything about weight, never phrased as a verdict

### Data portability — **core, do these, they're easy and solve a real problem**
- **Export/Import save**: download the whole state as a JSON file, load it back in — the pragmatic answer to "I got a new phone" without needing any backend
- **Shareable stat card**: render the Character sheet (or a chapter-completion moment) to a PNG client-side (e.g. `html-to-image`) for sharing outside the app

### Technical upgrades — **core, do these**
- Installable **PWA**: manifest + service worker for real "Add to Home Screen" behavior and offline support — this is a genuine upgrade now that there's a build step, worth doing
- Desktop niceties: keyboard shortcuts (1/2/3 to check in, arrow keys for tab nav), hover states — additive only, per `.windsurfrules`

### Stretch goals — **only after everything above is solid**
- 3D Home Base via React Three Fiber (a real orbitable beacon/camp scene) — high ceiling, real time cost, treat as a v3 idea if v2's 2D scene isn't feeling like enough
- Sound design (soft chimes on check-in, fanfare on level-up) via Howler.js — togglable, off by default, since this gets used around family
- Seasonal reskins of the Home Base tied to the real calendar (spring/summer/fall/winter) for novelty across a year of use
- True cross-device cloud sync via a free-tier backend (Supabase, etc.) — only worth the complexity if Export/Import genuinely isn't enough in practice
- "New Game+" prestige loop for after hitting the level ceiling, for long-horizon replay value

## 7. Build phases (work through these in order; stop and show the human at each boundary)

**Phase 0 — Scaffold & prove deployment.** Vite + React + TS + Tailwind v4 + dependencies from `.windsurfrules`. Wire the GitHub Actions deploy workflow (§8). Get a placeholder page actually live at the real Pages URL before writing a single feature. This is the step people skip and regret.

**Phase 1 — Core loop + state.** Zustand store with the `AppState` shape + persist middleware. Header (level badge, XP bar, currency chips). Home tab with the 3 check cards wired up. The shared reward-wrapper + toast queue.

**Phase 2 — Progression content.** Port the Main Quest / Side Quest chapter data and rendering. Calendar tab. Character tab with the 4 stats.

**Phase 3 — Rewards layer.** Achievements + Collections + Codex tab (start the constellation-map version here if time allows, flat list is a fine fallback). Shop/Flourishes + theme wardrobe.

**Phase 4 — Motion & visual pass.** Spring animations, confetti on Epic/Legendary, ambient particles, Home Base parallax.

**Phase 5 — Pick 2–3 new features.** Recommend starting with Export/Import save and PWA installability (low risk, real value), then one flashy centerpiece (Companion or the constellation map if not already done in Phase 3).

**Phase 6 — Stretch goals**, only if 0–5 are solid and there's appetite for more.

## 8. Deployment

`vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/the-reset/', // change to the actual repo name, case-sensitive
})
```

`.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Repo settings: **Settings → Pages → Source → GitHub Actions** (not "Deploy from a branch").

Quicker alternative for early local iteration: `npm i -D gh-pages`, add a `"deploy": "vite build && gh-pages -d dist"` script, run `npm run deploy`. Fine for solo quick pushes; the Actions workflow above is the better long-term setup since it deploys automatically on every push to `main`.
