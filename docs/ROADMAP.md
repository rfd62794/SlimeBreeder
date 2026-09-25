# Roadmap: SlimeBreeder

Why these milestones: the repo's own progression spec
(`docs/specs/economy_and_progression.md`) describes hard caps, gated
expansion, hatch costs, and diminishing discovery rates that the code
only partially implements, and the breeding spec explicitly defers
pattern/accessory traits and Phase-2 surfaces. These milestones close
that gap in dependency order — caps and gates first, economy tuning
second, new trait axes third, deferred polish last.

```yaml roadmap
status: draft
approved: ""
reviewed: "2026-09-24"
replan_after_days: 14
stop_if: "docs/specs/economy_and_progression.md is superseded by a newer progression design or Robert redirects the game — re-plan against the new design doc."
revive_if: ""
milestones:
  - id: M1
    title: Facility expansion is capped and gated per the economy spec
    status: active
    exit:
      - test: "npm test"
      - grep: {path: "src/config.ts", pattern: "PEN_CAPACITY_MAX"}
      - grep: {path: "src/config.ts", pattern: "TANK_COUNT_MAX"}
    steps:
      - id: M1.1
        title: Pen cap 30 with escalating upgrade cost
        kind: feature
        size: M
        value: 4
        needs: []
        status: pending
        directive: ""
        detail: Economy spec §2 — max pen 30, base ~10G, ~1.2x cumulative curve against current count. Add PEN_CAPACITY_MAX = 30 and a cost function (e.g. penUpgradeCost(currentCount)) to src/config.ts or src/utils/economics.ts, enforce both in buyPenUpgrade, and show next cost / cap state in ExpandFacility.tsx. TDD in gameStore.test.ts.
        accept:
          - test: "npm test"
          - grep: {path: "src/config.ts", pattern: "PEN_CAPACITY_MAX"}
      - id: M1.2
        title: Tank purchases capped at 4 and gated by trait discovery
        kind: feature
        size: M
        value: 4
        needs: []
        status: pending
        directive: ""
        detail: Economy spec §2 — tank 3 costs 40G and requires a discovered T3 trait; tank 4 (max) costs 60G and requires a discovered T4 trait. Spec also says base is 2 tanks while the store starts at 1 — follow the spec or amend it in place. Add TANK_COUNT_MAX = 4 and per-slot cost/gate data to src/config.ts, enforce in buyTankUpgrade, surface the requirement in MutatePage.tsx. TDD in gameStore.test.ts.
        accept:
          - test: "npm test"
          - grep: {path: "src/config.ts", pattern: "TANK_COUNT_MAX"}
      - id: M1.3
        title: Display slot 3 unlocked by request milestone plus 100G
        kind: feature
        size: M
        value: 3
        needs: []
        status: pending
        directive: ""
        detail: Economy spec §2 — slot 3 unlocks via milestone (completing 5 wanderer requests) plus 100G. Track fulfilled request count in persisted state (new Dexie version with upgrade handler), add a buyDisplaySlot-style action, and render the locked third slot with its requirement in DisplayRooms.tsx. Slot 4 stays locked until accessories exist (see M3.5).
        accept:
          - test: "npm test"
          - grep: {path: "src/config.ts", pattern: "DISPLAY_SLOT_MAX|DISPLAY_SLOT_3"}
  - id: M2
    title: Breeding and hatch economy matches the spec's tension model
    status: pending
    exit:
      - test: "npm test"
      - grep: {path: "src/config.ts", pattern: "DISCOVERY_CHANCE_BY_TIER"}
      - grep: {path: "src/config.ts", pattern: "HATCH_TRAIT_COST"}
    steps:
      - id: M2.1
        title: Reconcile spec numbers that conflict with the code
        kind: design
        size: S
        value: 3
        needs: []
        status: pending
        directive: ""
        detail: Three conflicts need a written decision before tuning lands: spec §3 charges gold per selected trait tier while the code only charges regents for locks; spec §3 display rate is 0.05G/s while DISPLAY_BASE_RATE is 0.5; spec §4 wants symmetric 1:1 regent spend while REGENT_LOCK_COST is 2/5/12/25. Record the decisions in docs/specs/economy_reconciliation.md (or amend the spec in place).
        accept:
          - file: "docs/specs/economy_reconciliation.md"
      - id: M2.2
        title: Diminishing discovery rates by result tier
        kind: feature
        size: S
        value: 4
        needs: []
        status: pending
        directive: ""
        detail: Economy spec §5 Rule 2 — recipe success chance scales with result tier: T2 40%, T3 25%, T4 5%. Replace flat BREED_DISCOVERY_CHANCE with DISCOVERY_CHANCE_BY_TIER in src/config.ts and apply it in src/utils/discovery.ts (breedColor/breedShape). Cover each tier boundary with mocked Math.random in the discovery/breed tests.
        accept:
          - test: "npm test"
          - grep: {path: "src/config.ts", pattern: "DISCOVERY_CHANCE_BY_TIER"}
      - id: M2.3
        title: Gold cost for hatched trait selection
        kind: feature
        size: M
        value: 3
        needs: [M2.1]
        status: pending
        directive: ""
        detail: Economy spec §3 — hatching pulls from treasury: add the costs of all desired configuration traits (T1 5G, T2 15G, T3 50G, T4 150G per tree). Add HATCH_TRAIT_COST to src/config.ts, charge gold in startHatch per the M2.1 decision (how gold cost interacts with regent locks), and show the price in HatchButton.tsx. TDD in gameStore.test.ts.
        accept:
          - test: "npm test"
          - grep: {path: "src/config.ts", pattern: "HATCH_TRAIT_COST"}
      - id: M2.4
        title: Regent spend matches the spec's 1:1 equilibrium
        kind: refactor
        size: S
        value: 2
        needs: [M2.1]
        status: pending
        directive: ""
        detail: Economy spec §4 — locking a trait costs exactly its discovery yield (T2 5, T3 15, T4 40; T1 earns 0). Align REGENT_LOCK_COST in src/config.ts with whatever M2.1 decided, and update the lock-cost tests.
        accept:
          - test: "npm test"
          - grep: {path: "src/config.ts", pattern: "REGENT_LOCK_COST"}
  - id: M3
    title: Pattern and accessory trait dimensions
    status: pending
    exit:
      - test: "npm test"
      - grep: {path: "src/data/traitDefs.ts", pattern: "PATTERN_DEFS|ACCESSORY_DEFS"}
      - grep: {path: "src/types.ts", pattern: "pattern"}
    steps:
      - id: M3.1
        title: Design spec for pattern and accessory traits
        kind: design
        size: M
        value: 3
        needs: []
        status: pending
        directive: ""
        detail: Breeding spec §2 and economy spec §3 defer cosmetic overlays (patterns, accessories) with their own tier costs and regent prices. Write docs/specs/patterns_and_accessories.md covering trait lists per tier, recipe tables, how overlays compose onto SlimeVisual, persistence shape, and unlock rules — mirror the existing spec format in docs/superpowers/specs/.
        accept:
          - file: "docs/specs/patterns_and_accessories.md"
      - id: M3.2
        title: Trait model, persistence, and generation for new axes
        kind: feature
        size: M
        value: 4
        needs: [M3.1]
        status: pending
        directive: ""
        detail: Implement the M3.1 spec's data layer: extend src/types.ts Slime and src/data/traitDefs.ts with PATTERN_DEFS/ACCESSORY_DEFS registries, extend generateSlime and the discovery reward pools, and add a new Dexie version with an upgrade handler that defaults existing saves. Keep migration additive per the v1-v5 chain in src/db/db.ts.
        accept:
          - test: "npm test"
          - grep: {path: "src/data/traitDefs.ts", pattern: "PATTERN_DEFS"}
      - id: M3.3
        title: Breeding recipes and discovery for new axes
        kind: feature
        size: M
        value: 4
        needs: [M3.2]
        status: pending
        directive: ""
        detail: Extend src/utils/discovery.ts and src/utils/breedSlimes.ts so pattern/accessory dimensions inherit and discover via the same recipe + tiered-chance model as color/shape (the M2.2 rate table applies). Cover recipe hits, misses, and new-discovery regent awards in tests.
        accept:
          - test: "npm test"
      - id: M3.4
        title: UI surfaces for patterns and accessories
        kind: feature
        size: M
        value: 3
        needs: [M3.3]
        status: pending
        directive: ""
        detail: Render the new axes: SlimeVisual overlays per the M3.1 spec, CODEX sections in DiscoveryPage.tsx, optional lock dropdowns in HatchButton.tsx, and target chips on MarketPage.tsx requests if the generator emits them. No tests for pure UI per repo convention — store/util logic carries the coverage.
        accept:
          - test: "npm test"
      - id: M3.5
        title: Display slot 4 unlocked via T3 accessory plus 300G
        kind: feature
        size: S
        value: 2
        needs: [M1.3, M3.2]
        status: pending
        directive: ""
        detail: Economy spec §2 — slot 4 (max cap) unlocks after finding a Tier 3 accessory plus 300G. Extend the M1.3 unlock mechanism with the accessory gate now that accessories exist. TDD in gameStore.test.ts.
        accept:
          - test: "npm test"
          - grep: {path: "src/config.ts", pattern: "DISPLAY_SLOT_MAX|DISPLAY_SLOT_4"}
  - id: M4
    title: Deferred Phase-2 surfaces and ship-readiness
    status: pending
    exit:
      - test: "npm test"
      - grep: {path: "README.md", pattern: "Slime"}
    steps:
      - id: M4.1
        title: Visitor offers in display rooms
        kind: feature
        size: M
        value: 3
        needs: []
        status: pending
        directive: ""
        detail: Deferred in the game-slice spec §6 — visitors periodically offer to buy displayed slimes at a premium. Needs a small design note first (offer cadence, pricing, accept/decline UX), then store actions and a DisplayRooms.tsx surface. Keep it offline-computable on load like the rest of the idle economy.
        accept:
          - test: "npm test"
      - id: M4.2
        title: Tap-to-speed hatching and optional per-breed timers
        kind: feature
        size: M
        value: 2
        needs: []
        status: pending
        directive: ""
        detail: Deferred in the breeding spec §2 and §9 — tapping an incubating tank shaves time off the timer; breeds may also get their own duration distinct from HATCH_DURATION_MS. Implement in IncubationProgress.tsx + store, respecting the no-animation rule.
        accept:
          - test: "npm test"
      - id: M4.3
        title: Replace the Vite-template README
        kind: docs
        size: S
        value: 2
        needs: []
        status: pending
        directive: ""
        detail: README.md is still the stock React+TS+Vite template. Write a real one: what the game is, how to run dev/build/test, PWA/offline notes, and pointers to docs/DIRECTION.md and the specs.
        accept:
          - grep: {path: "README.md", pattern: "Slime"}
```
