# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

delegated: Next.js 16.4+ (App Router + TypeScript), `@heroui/react@2.8.10` + Tailwind CSS v4 + Framer Motion, `lucide-react`, `leaflet` + `react-leaflet`, `chart.js` + `react-chartjs-2`, `@google/generative-ai` (Gemini API), unified full-stack Route Handlers with offline NASA fallback.

## Users

- Primary users: Egyptian agronomists, farm managers, and smallholder/commercial farmers in the Nile Delta, Middle Egypt, and reclaimed desert oases evaluating multi-season crop rotations under heat and irrigation stress.
- Secondary evaluators: NASA Space Apps 2026 (Field Shift Challenge) judging panel verifying scientific rigor, multi-scale NASA telemetry integration, tradeoff transparency, and uncertainty communication.

## Product Purpose

OrbitAgri is a single-screen agronomic decision cockpit ("Field Shift: Adapting Farms with NASA Data") that transforms multi-scale NASA Earth observations (`NASA POWER`, `MODIS NDVI`, `SMAP GWETROOT`, and `ASF Sentinel-1 SAR`) into 3-season crop rotation pathways, statistical yield-profit uncertainty bands (`P10 / P50 / P90`), and plain Egyptian Arabic agricultural advice.

## Positioning

Instead of recommending a single static crop, OrbitAgri unifies 4 spatial observation scales on one screen, compares 3 consecutive 3-season rotation pathways head-to-head under simulated heat waves (`+0°C` to `+4.5°C`) and water deficits (`0%` to `-45%`), exposes hidden tradeoffs (urea fertilizer sacks, irrigation water savings, nitrogen balance, pest-break capability), and quantifies 10-year climate uncertainty (`P10 / P50 / P90` & `CV%`) with a resilient offline NASA fallback.

## Operating Context

- Full RTL Arabic (`lang="ar" dir="rtl"`) Dark Mission Control HUD engineered for single-screen comparison during field advisory sessions and live hackathon judging.
- Supports both live NASA POWER / ASF Sentinel-1 API queries (cached 24h via Next.js `revalidate: 86400` with a 6-second timeout) and instant offline fallback (`nasaFallback.ts`).

## Capabilities and Constraints

- 10 Egyptian crops across 5 botanical families (`Poaceae`, `Fabaceae`, `Solanaceae`, `Amaranthaceae`, `Asteraceae`) with nitrogen balance, water demand, profit, heat tolerance, drought tolerance, pest-break score, and root depth.
- 6 Egyptian agricultural governorates (الغربية، الدقهلية، البحيرة، المنيا، الفيوم، الوادي الجديد) plus interactive map coordinate selection.
- Leaflet map dynamically imported with `{ ssr: false }` to prevent SSR `window is not defined` errors, overlaid with NASA GIBS `MODIS_Terra_NDVI_8Day` WMTS tiles.
- Gemini AI Copilot (`/api/copilot`) with deterministic Egyptian Arabic agronomic fallback when `GEMINI_API_KEY` is absent or offline.

## Brand Commitments

- Name: **OrbitAgri — Field Shift: Adapting Farms with NASA Data**
- Visual commitment: Dark Mission Control HUD using HeroUI v2 dark theme and 12-column responsive single-screen layout (`grid-cols-12`) in Arabic RTL.

## Evidence on Hand

- Product Requirements Document (PRD) defining exact file tree, HeroUI components, NASA APIs, statistical percentile formulas (`P10`, `P50`, `P90`), and 4 team workstreams.
- NASA GIBS WMTS endpoint, NASA POWER Monthly API (`2015–2024`), and ASF Search API (`Sentinel-1`).

## Product Principles

1. Multi-scale telemetry must translate directly into farmer-level decisions (urea sacks, cubic meters of water, EGP/feddan).
2. Compare multi-season rotations, never isolated single crops, and flag botanical family conflicts immediately.
3. Make climate risk and uncertainty explicit via `P10 / P50 / P90` bands and interactive stress sliders.
4. Maintain live scientific auditability (`RawJsonModal`) alongside offline resilience (`nasaFallback.ts`).

## Accessibility & Inclusion

- High-contrast dark HUD surfaces with clear Arabic typography (`Cairo`), tabular numeric alignment (`tabular-nums`), and keyboard-accessible HeroUI controls.

