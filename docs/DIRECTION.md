# Direction: SlimeBreeder

## Purpose

Offline-first idle breeding game for mobile (PWA, target Moto G 2025).
Players hatch and breed slimes, discover new color and shape traits
through curated breeding recipes, and earn gold from selling slimes,
passive display-room income, and wanderer contracts. Stack: React 19 +
TypeScript + Vite, Zustand v5, Dexie/IndexedDB persistence, Tailwind v4,
Vitest 4.

Sources: `docs/specs/economy_and_progression.md`,
`docs/superpowers/specs/2026-04-10-game-slice-visual-slime-design.md`,
`package.json`.

## Current state

Playable core loop across four tabs (`src/App.tsx`,
`src/components/BottomNav.tsx`):

- CHAMBER: timed incubation (30s) with optional regent trait locks, pen
  inventory, two display slots paying passive gold per second, flat-cost
  pen expansion (`HatchButton.tsx`, `DisplayRooms.tsx`,
  `ExpandFacility.tsx`).
- MUTATE: multi-tank incubation and host/donor breeding where the donor
  is consumed (`MutatePage.tsx`, `BreedingPanel.tsx`, `TankCard.tsx`).
- CODEX: discovery trees for 12 colors and 11 shapes across 4 tiers with
  recipe hints (`DiscoveryPage.tsx`, `src/data/traitDefs.ts`,
  `src/utils/discovery.ts`).
- MARKET: wanderer contracts — generated requests fulfilled for premium
  gold (`MarketPage.tsx`, `src/utils/requestGenerator.ts`).

State lives in a Zustand store (`src/store/gameStore.ts`) persisted to
Dexie, schema at version 5 (`src/db/db.ts`). Regents are earned on first
discovery of a trait and spent to lock hatch traits (`src/config.ts`).
Tests: `npm test` (vitest run).

## Next steps

The economy spec (`docs/specs/economy_and_progression.md`) is the stated
progression design and is only partially implemented:

- §2 hard caps: pen cap 30 with an escalating cost curve (currently flat
  20G, no cap); tank cap 4 with T3/T4-trait-gated purchases (currently
  flat 50G, no cap, base 1 tank vs spec's 2); display slots 3-4 as gated
  unlocks (currently fixed at 2).
- §3 hatch gold costs per selected trait tier — hatching currently costs
  regents for locks but no gold.
- §4 regent 1:1 equilibrium — discovery earnings match the spec
  (T2:5/T3:15/T4:40) but lock spend (2/5/12/25) does not.
- §5 Rule 2 diminishing discovery rates 40%/25%/5% by result tier —
  currently a flat `BREED_DISCOVERY_CHANCE` of 0.40.
- Cosmetic trait slots (patterns, accessories) — deferred in
  `docs/superpowers/specs/2026-04-11-breeding-design.md` §2.
- Phase-2 leftovers deferred in the specs: visitor offers in display
  rooms, tap-to-speed hatching, per-breed hatch timers, hand-drawn
  sprites.
- `README.md` is still the default Vite template.

## Definition of done

- Every mechanic in `docs/specs/economy_and_progression.md` is either
  implemented or explicitly amended in the spec.
- `npm test` passes in the repo root.
- Deferred items are either built or recorded as parked in
  `docs/ROADMAP.md`.

## Do not

- No animations — explicit in the game-slice design spec.
- No backend or server dependency — offline-first; idle income is
  computed on load, not ticked by a server.
- Keep tuning constants in `src/config.ts` (established convention).
- Extend the Dexie schema only via new versioned upgrade handlers —
  never edit an existing version block (`src/db/db.ts` v1-v5).
- No invented features — work comes from the specs in `docs/`.

## Sources of truth

- `docs/specs/economy_and_progression.md` — progression/economy design
- `docs/superpowers/specs/` — feature design specs
- `docs/superpowers/plans/` — implementation plans (TDD style)
- `src/config.ts` — tuning constants
- `src/data/traitDefs.ts` — trait registry (colors, shapes, tiers)
- `package.json` — scripts (`npm test`, `npm run build`, `npm run lint`)
- `docs/directives/` — queued agent work
