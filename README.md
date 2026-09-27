# KINETIC CORE

### Combat Training × Strength Performance × Precision Timing Operating System

> **"Zero friction between deciding to train and actually training."**

KINETIC CORE is an offline-first training operating system specifically engineered for boxers, martial artists, combat athletes, and strength athletes. Built to perform as tactile training equipment translated into software.

---

## 01. PRODUCT PHILOSOPHY & TECHNICAL INTEGRITY

1. **SPEED**: 1-tap activation into a locked training state. No login walls, social feeds, or video carousels.
2. **PRECISION**: Zero cumulative timing drift via an isolated Web Worker clock synchronized against high-resolution `performance.now()` timestamps.
3. **OFFLINE-FIRST SOVEREIGNTY**: 100% of athlete logs, intervals, combinations, and personal records persist exclusively inside local **IndexedDB**.
4. **ZERO FRICTION (BOXING GLOVES & SWEAT)**: Touch targets exceed 80px, automated Screen Wake Lock API prevents phone sleeping, and full physical keyboard bindings (`Space`, `→`, `R`, `M`, `F`, `ESC`) allow complete hands-free training.
5. **STRICT DATA INTEGRITY**: Never manufactures or fakes biometric data. Every reading is strictly tagged:
   - `[MEASURED]`: Real physical hardware or high-res performance clock timestamps.
   - `[CALCULATED]`: Mathematical derivations (1RM, mechanical volume, kinetic load, round countdown).
   - `[MANUALLY ENTERED]`: Athlete-logged weights, reps, RPE, technique counts, notes.
   - `[SIMULATED]`: Demo previews.

---

## 02. SYSTEM ARCHITECTURE

```text
kinetic-core/
├── app/
│   ├── layout.tsx             # Root layout with PWA meta & TopNav telemetry
│   ├── page.tsx               # Cinematic product landing page (GSAP + Lenis + Three.js)
│   ├── train/                 # Athlete Command Center & Locked Hands-Free Console
│   ├── timer/                 # Combat interval timer suite & drift-free presets
│   ├── strength/              # Strength OS: Set logging, 1RM lab, progressive overload
│   ├── combat/                # Combination Lab (1-2-3-2) & Taekwondo symmetry drills
│   ├── builder/               # Modular session timeline builder
│   ├── analytics/             # Performance lab: Volume charts, Silhouette map, PRs
│   ├── history/               # Activity calendar heatmap, logs, JSON/CSV exports
│   └── settings/              # Audio diagnostics, developer drift telemetry, shortcuts
│
├── components/
│   ├── CoreTimer/             # RadialCountdown (high-FPS SVG ring), LockedTrainingView
│   ├── RoundTimer/            # RoundConfigModal, interval parameters
│   ├── SetTracker/            # ExerciseLogger, live mechanical volume
│   ├── StrengthCalculator/    # OneRepMaxModal (Epley, Brzycki, Lombardi, Mayhew), ProgressionCalculator
│   ├── CombatLab/             # CombinationRecorder, TaekwondoDrillTracker
│   ├── SessionBuilder/        # BlockTimeline drag/reorder timeline
│   ├── KineticGraph/          # VolumeOverTimeChart SVG vector curves
│   ├── TrainingHeatmap/       # ActivityGrid GitHub-style calendar
│   ├── BodyMovementMap/       # SilhouetteMap athletic strain visualizer
│   ├── AudioController/       # AudioDiagnosticsPanel & Web Audio synthesizer triggers
│   ├── Diagnostics/           # TimerDriftMonitor internal developer clock monitor
│   ├── Navigation/            # TopNav, SystemStatusBadge
│   └── ThreeBackground/       # KineticParticleField 3D vector field
│
├── lib/
│   ├── audio/                 # Web Audio API algorithmic synthesizer & vibration
│   ├── timing/                # Authoritative TimerCoordinator, Web Worker, Wake Lock
│   ├── calculations/          # 1RM formulas, volume, progressive overload, kinetic load
│   ├── storage/               # IndexedDB engine, JSON/CSV export/import, localStorage
│   └── analytics/             # Stats aggregator, streaks, PR extractor, heatmap matrix
│
├── workers/
│   └── timer.worker.ts        # Authoritative background clock worker
└── types/
    ├── index.ts               # Core domain models
    └── sensor.ts              # Pluggable future BLE/IMU SensorProvider interface
```

---

## 03. TIMING & AUDIO ENGINE: WHY NOT `setInterval()`?

### The Drift Problem in Standard Fitness Apps
In JavaScript, `setInterval()` is a macroscopic browser event queue task. When a tab is in the background, the screen turns off, or CPU load spikes, browsers aggressively throttle timers down to 1Hz or pause them entirely. Over a 36-minute boxing workout, standard timers drift by up to **8 to 30 seconds**.

### KINETIC CORE Architecture:
```text
HARDWARE EPOCH (performance.now())
           ↓
WEB WORKER THREAD (timer.worker.ts)
           ↓
HIGH RESOLUTION DELTA DRIFT COMPENSATION (20 Hz pulse)
           ↓
AUTHORITATIVE TIMER COORDINATOR (timerCoordinator.ts)
           ↓
WEB AUDIO API SCHEDULER (currentTime)
           ↓
BRONZE BELLS / WOOD CLAPPERS / COUNTDOWN PINGS
```

1. **Worker Isolation**: The clock worker runs on an isolated background thread immune to main-thread UI DOM lag.
2. **Delta Compensation**: Each tick computes `actual - expected` drift and recalibrates in real-time.
3. **Acoustic Synthesis**: Sounds are generated mathematically via `AudioContext` oscillators, bandpass filters, and noise buffers rather than external audio files. This guarantees zero audio load latency, offline operation, and authentic bronze bell harmonic decay.

---

## 04. 1-REP MAX (1RM) FORMULAS

KINETIC CORE provides transparent mathematical derivations across 4 validated formulas:

1. **Epley Formula**:
   $$\text{1RM} = w \times \left(1 + \frac{r}{30}\right)$$
   *Standard gold standard for 3–10 reps.*

2. **Brzycki Formula**:
   $$\text{1RM} = w \times \frac{36}{37 - r}$$
   *Conservative linear regression model.*

3. **Lombardi Formula**:
   $$\text{1RM} = w \times r^{0.10}$$
   *Power-law scaling curve.*

4. **Mayhew et al. Formula**:
   $$\text{1RM} = \frac{100 \times w}{52.2 + 41.9 \times e^{-0.055 \times r}}$$
   *Collegiate resistance testing exponential curve.*

---

## 05. TRANSPARENT KINETIC LOAD FORMULA

KINETIC LOAD is a composite training stress estimation based strictly on logged mechanical work and interval density:

$$\text{Strength Component} = \left(\text{Volume}_{\text{kg}} \times \frac{\text{RPE}}{10} \times 0.015\right) + (\text{Sets} \times 2.5)$$

$$\text{Combat Component} = \left(\frac{\text{WorkSeconds}}{60} \times 15\right) + (\text{RoundsCompleted} \times 8)$$

$$\text{Kinetic Load} = \text{Strength Component} + \text{Combat Component}$$

*Not a medical cardiovascular assessment. It provides an objective relative training stress metric across sessions.*

---

## 06. KEYBOARD HOTKEYS

| Key | Action | Context |
|---|---|---|
| **SPACE** | Pause / Resume Training Clock | Locked Console |
| **→** | Skip Interval / Advance Round | Locked Console |
| **R** | Restart Session | Locked Console |
| **M** | Mute / Unmute Audio | Global |
| **F** | Toggle Fullscreen (Kiosk Mode) | Locked Console |
| **ESC** | Disarm & Exit Console | Locked Console |

---

## 07. VERIFICATION & TESTS

All mathematical models and formulas are verified with unit tests:
```bash
node scripts/verify-calculations.js
```
Validates:
- 1RM estimations within 0.1kg tolerance
- Set and session mechanical tonnage summation
- Fatigue-based and progression-based overload heuristics
- Kinetic Load stress tiering

---

## 08. PROJECT ROADMAP

- [x] **PHASE 01: CORE TIMER** (Web Worker, Web Audio bells, clappers, glove-safe UI)
- [x] **PHASE 02: STRENGTH TRACKING** (Sets, reps, RPE, 1RM lab, progressive overload)
- [x] **PHASE 03: TRAINING ANALYTICS** (Volume charts, activity calendar heatmap, PRs)
- [x] **PHASE 04: COMBINATION & COMBAT MODULE** (1-2-3-2 cadence, Taekwondo kicks)
- [x] **PHASE 05: ADVANCED VISUALIZATION** (Three.js kinetic field, Silhouette map, Lenis)
- [ ] **PHASE 06: OPTIONAL SENSOR INTEGRATION** (`SensorProvider` interface created for BLE/IMU)
