# Design System — ElMazra3a EL sa3ida

## Visual Direction

- **Mode:** Operate (Single-screen Agronomic Decision Cockpit)
- **Language & Direction:** Arabic RTL (`lang="ar" dir="rtl"`)
- **Form:** Orbital Agronomic Mission Control HUD (`grid-cols-12` single-screen cockpit with top mission bar)

## Palette & Surfaces

- **Primary Ground:** `#070b12` (Deep orbital slate)
- **Panel Surface (`hud-panel`):** `#0d1421` with `1px solid #1e293b` borders and subtle downward elevation shadow (`0 12px 28px -12px rgba(2, 6, 23, 0.85)`)
- **Inset Sub-Panel (`hud-subpanel`):** `#090f1b` with `1px solid #1e293b`
- **Raw JSON / Map Basin:** `#05080f`
- **Primary Text:** `#f1f5f9` / `#e2e8f0`
- **Secondary Text:** `#94a3b8`
- **Semantic State Roles:**
  - Balanced / Nitrogen Fixation / Healthy (`success`): `#10b981` (`emerald-400`/`500`)
  - Climate Resilience / Moisture (`primary`): `#0ea5e9` / `#38bdf8` (`sky-400`/`500`)
  - Heat Anomaly / Stress Warning (`warning`): `#f59e0b` (`amber-400`)
  - Cash Depletion / Botanical Conflict (`danger`): `#f43f5e` (`rose-400`/`500`)

## Typography

- **Primary Face:** `Cairo` (loaded via `next/font/google`, weights 400–800) with Arabic and Latin subsets.
- **Tabular Telemetry:** `.tabular-telemetry` (`font-variant-numeric: tabular-nums`) applied to all coordinates, temperatures, percentages, EGP profits, and percentile bands (`P10/P50/P90`).
- **Hierarchy:** Clean bold headings (`text-sm font-bold` / `text-base font-extrabold`) without eyebrow/kicker labels or gradient text.

## Layout & Grid

- **Top Mission Bar (`TopMissionBar`):** HeroUI `Navbar` containing ElMazra3a EL sa3ida identity, live coordinate telemetry, Soil Health `Progress` bar, Urea & Water savings `Chip`s, and the `RawJsonModal` trigger.
- **3-Column Cockpit (`grid-cols-12 gap-3.5`):**
  1. **Right Column (`col-span-12 lg:col-span-4`):** Governorate `Select`, interactive Leaflet satellite + NASA GIBS MODIS NDVI map (`FarmMap`), and 4-scale `MultiScaleTabs`.
  2. **Center Column (`col-span-12 lg:col-span-4`):** Previous Crop `ButtonGroup`, Heat/Water `StressSliders`, 3 clickable `PathwayCards`, and interactive 3×3 `FieldGrid3x3`.
  3. **Left Column (`col-span-12 lg:col-span-4`):** 5-axis `TradeoffRadar` (`Chart.js`), `UncertaintyBands` (`P10 / P50 / P90` + `CV%`), and `AiCopilotCard`.

## Component & Browser Surface Discipline

- Built on `@heroui/react@2.8.10` (`dark` class) with `lucide-react` icons only.
- Custom-themed dark scrollbars, emerald text selection, and emerald input carets in `src/app/globals.css`.
- Leaflet map container isolated to client rendering (`dynamic(..., { ssr: false })`) with `dir="ltr"` scoped strictly to the map canvas.

