"use client";

import { useLanguage } from "@/app/providers";
import {
  Button,
  ButtonGroup,
  Chip,
  Select,
  SelectItem,
  Skeleton,
} from "@heroui/react";
import { AiCopilotCard } from "@/components/analytics/AiCopilotCard";
import { TradeoffRadar } from "@/components/analytics/TradeoffRadar";
import { UncertaintyBands } from "@/components/analytics/UncertaintyBands";
import { PitchModal } from "@/components/hud/PitchModal";
import { RawJsonModal } from "@/components/hud/RawJsonModal";
import { TopMissionBar } from "@/components/hud/TopMissionBar";
import { MultiScaleTabs } from "@/components/map/MultiScaleTabs";
import { FieldGrid3x3 } from "@/components/simulation/FieldGrid3x3";
import { PathwayCards } from "@/components/simulation/PathwayCards";
import { StressSliders } from "@/components/simulation/StressSliders";
import {
  CROPS_MATRIX,
  PREVIOUS_CROPS,
  PreviousCropId,
} from "@/data/cropsMatrix";
import {
  FEATURED_PRESET_IDS,
  findNearestGovernorate,
  GOVERNORATES,
} from "@/data/governorates";
import {
  buildRawNasaPayload,
  getFallbackAnnualClimate,
  getFallbackMultiScale,
} from "@/data/nasaFallback";
import { CountryCode, formatProfitWithUnit } from "@/lib/currency";
import { PathwayId, runFieldShiftSimulation } from "@/lib/simulationEngine";
import { CopilotApiResponse, FieldShiftApiResponse } from "@/types/fieldShift";
import {
  Compass,
  GitCompareArrows,
  MapPin,
  SlidersHorizontal,
  Sprout,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const FarmMap = dynamic(() => import("@/components/FarmMap"), {
  ssr: false,
  loading: () => (
    <Skeleton className="h-[250px] w-full rounded-xl bg-slate-900 border border-slate-800" />
  ),
});

function buildInitialState(): FieldShiftApiResponse {
  const gov = GOVERNORATES[0];
  const prevCropId: PreviousCropId = "wheat";
  const heatStressC = 1.5;
  const waterDeficitPct = 15;
  const annualRecords = getFallbackAnnualClimate(gov, gov.lat, gov.lon);
  const multiScale = getFallbackMultiScale(gov, annualRecords, gov.lat, gov.lon);
  const pathways = runFieldShiftSimulation({
    gov,
    prevCropId,
    heatStressC,
    waterDeficitPct,
    annualRecords,
  });
  const active = pathways.balanced;

  return {
    governorate: gov,
    coordinates: { lat: gov.lat, lon: gov.lon },
    prevCropId,
    heatStressC,
    waterDeficitPct,
    selectedPathwayId: "balanced",
    multiScale,
    annualRecords,
    pathways,
    hudMetrics: {
      soilHealthScore: active.soilHealthScore,
      ureaSacksSaved: active.ureaSacksSaved,
      waterSavedPct: active.waterSavedPct,
      colorTheme: active.colorTheme,
    },
    sourceStatus: {
      powerLive: false,
      asfLive: false,
      modeLabelAr: "بيانات دلتا النيل المحفوظة (Offline Fallback)",
      modeLabelEn: "Cached Nile Delta Climate Baseline (Offline Fallback)",
    },
    rawJson: buildRawNasaPayload({
      gov,
      lat: gov.lat,
      lon: gov.lon,
      annualRecords,
      multiScale,
      powerLive: false,
      asfLive: false,
      powerEndpoint: "https://power.larc.nasa.gov/api/temporal/monthly/point",
      asfEndpoint: "https://api.daac.asf.alaska.edu/services/search/param",
    }),
  };
}

export default function OrbitAgriCockpitPage() {
  const { isAr } = useLanguage();
  const [govId, setGovId] = useState<string>(GOVERNORATES[0].id);
  const [coords, setCoords] = useState<{ lat: number; lon: number }>({
    lat: GOVERNORATES[0].lat,
    lon: GOVERNORATES[0].lon,
  });
  const [prevCropId, setPrevCropId] = useState<PreviousCropId>("wheat");
  const [heatStressC, setHeatStressC] = useState<number>(1.5);
  const [waterDeficitPct, setWaterDeficitPct] = useState<number>(15);
  const [selectedPathwayId, setSelectedPathwayId] =
    useState<PathwayId>("balanced");

  const [data, setData] = useState<FieldShiftApiResponse>(() => buildInitialState());
  const [copilot, setCopilot] = useState<CopilotApiResponse | null>(null);
  const [copilotLoading, setCopilotLoading] = useState<boolean>(true);
  const [isRawModalOpen, setIsRawModalOpen] = useState<boolean>(false);
  const [isPitchModalOpen, setIsPitchModalOpen] = useState<boolean>(false);

  const copilotAbortRef = useRef<AbortController | null>(null);
  const fieldAbortRef = useRef<AbortController | null>(null);

  // Instant local simulation recalculation for zero-latency slider interaction
  const instantData = useMemo(() => {
    const gov =
      GOVERNORATES.find((g) => g.id === govId) ??
      findNearestGovernorate(coords.lat, coords.lon);
    const pathways = runFieldShiftSimulation({
      gov,
      prevCropId,
      heatStressC,
      waterDeficitPct,
      annualRecords: data.annualRecords,
    });
    const active = pathways[selectedPathwayId];
    return {
      ...data,
      governorate: gov,
      coordinates: coords,
      prevCropId,
      heatStressC,
      waterDeficitPct,
      selectedPathwayId,
      pathways,
      hudMetrics: {
        soilHealthScore: active.soilHealthScore,
        ureaSacksSaved: active.ureaSacksSaved,
        waterSavedPct: active.waterSavedPct,
        colorTheme: active.colorTheme,
      },
    };
  }, [
    data,
    govId,
    coords,
    prevCropId,
    heatStressC,
    waterDeficitPct,
    selectedPathwayId,
  ]);

  const fetchCopilot = useCallback(
    async (simState: FieldShiftApiResponse) => {
      copilotAbortRef.current?.abort();
      const controller = new AbortController();
      copilotAbortRef.current = controller;
      setCopilotLoading(true);

      const selected = simState.pathways[simState.selectedPathwayId];
      const cash = simState.pathways.cash;
      const prevCrop = CROPS_MATRIX[simState.prevCropId];

      try {
        const res = await fetch("/api/copilot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            country: simState.governorate.country,
            governorateNameAr: simState.governorate.nameAr,
            governorateNameEn: simState.governorate.nameEn,
            prevCropNameAr: prevCrop.nameAr,
            prevCropNameEn: prevCrop.nameEn,
            heatStressC: simState.heatStressC,
            waterDeficitPct: simState.waterDeficitPct,
            selectedPathway: {
              id: selected.id,
              titleAr: selected.titleAr,
              titleEn: selected.titleEn,
              seasonsNamesAr: selected.seasons.map((s) => s.nameAr),
              seasonsNamesEn: selected.seasons.map((s) => s.nameEn),
              p10Egp: selected.p10Egp,
              p50Egp: selected.p50Egp,
              p90Egp: selected.p90Egp,
              cvPct: selected.cvPct,
              ureaSacksSaved: selected.ureaSacksSaved,
              waterSavedPct: selected.waterSavedPct,
              hasFamilyConflict: selected.hasFamilyConflict,
              conflictDetailsAr: selected.conflictDetailsAr,
              conflictDetailsEn: selected.conflictDetailsEn,
            },
            cashPathway: {
              p10Egp: cash.p10Egp,
              p50Egp: cash.p50Egp,
            },
            multiScale: {
              meanT2mC: simState.multiScale.power.meanT2mC,
              ndviValue: simState.multiScale.modis.ndviValue,
              rootMoisturePct: simState.multiScale.smap.rootMoisturePct,
              polarization: simState.multiScale.asf.polarization,
            },
          }),
        });

        if (!res.ok) throw new Error("Copilot API error");
        const json = (await res.json()) as CopilotApiResponse;
        setCopilot(json);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          const p50Ar = formatProfitWithUnit(
            selected.p50Egp,
            simState.governorate.country,
            true
          );
          const p50En = formatProfitWithUnit(
            selected.p50Egp,
            simState.governorate.country,
            false
          );
          setCopilot({
            mode: "offline-agronomic-advisor",
            headlineAr: `ملخص القرار في ${simState.governorate.nameAr}`,
            headlineEn: `Decision Summary for ${simState.governorate.nameEn}`,
            adviceAr: `المسار المختار (${selected.titleAr}) بيحقق متوسط ربح ${p50Ar} مع توفير ${selected.ureaSacksSaved} شكارة يوريا و${selected.waterSavedPct}% من مياه الري.`,
            adviceEn: `The selected ${selected.titleEn} yields a median profit of ${p50En} while saving ${selected.ureaSacksSaved} urea sacks and ${selected.waterSavedPct}% irrigation water.`,
            actionChecklistAr: [
              `حافظ على تنويع العائلة النباتية بعد ${prevCrop.nameAr}.`,
              `استعد لموجة حر +${simState.heatStressC}°C بمتابعة رطوبة التربة من قمر ناسا (SMAP).`,
            ],
            actionChecklistEn: [
              `Keep botanical family diversity after ${prevCrop.nameEn}.`,
              `Prepare for +${simState.heatStressC}°C heat stress by monitoring NASA SMAP root moisture.`,
            ],
          });
        }
      } finally {
        if (!controller.signal.aborted) {
          setCopilotLoading(false);
        }
      }
    },
    []
  );

  // Sync live NASA POWER & ASF data from GET /api/field-shift
  useEffect(() => {
    const timer = setTimeout(async () => {
      fieldAbortRef.current?.abort();
      const controller = new AbortController();
      fieldAbortRef.current = controller;

      try {
        const qs = new URLSearchParams({
          govId,
          lat: coords.lat.toFixed(4),
          lon: coords.lon.toFixed(4),
          prev_crop: prevCropId,
          heat_shock_c: String(heatStressC),
          water_deficit_pct: String(waterDeficitPct),
          selectedPathway: selectedPathwayId,
        });
        const res = await fetch(`/api/field-shift?${qs.toString()}`, {
          method: "GET",
          signal: controller.signal,
        });

        if (!res.ok) return;
        const json = (await res.json()) as FieldShiftApiResponse;
        setData(json);
      } catch {
        // Keep instant local state if aborted or offline
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [
    govId,
    coords.lat,
    coords.lon,
    prevCropId,
    heatStressC,
    waterDeficitPct,
    selectedPathwayId,
  ]);

  // Trigger AI Copilot summary cleanly after simulation updates
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCopilot(instantData);
    }, 350);
    return () => clearTimeout(timer);
  }, [
    govId,
    coords.lat,
    coords.lon,
    prevCropId,
    heatStressC,
    waterDeficitPct,
    selectedPathwayId,
    fetchCopilot,
  ]);

  const handleSelectGovernorate = (selectedId: string) => {
    const found = GOVERNORATES.find((g) => g.id === selectedId);
    if (!found) return;
    setGovId(found.id);
    setCoords({ lat: found.lat, lon: found.lon });
  };

  const handleMapClick = (lat: number, lon: number) => {
    const nearest = findNearestGovernorate(lat, lon);
    setGovId(nearest.id);
    setCoords({ lat, lon });
  };

  const activeCountry: CountryCode = instantData.governorate.country;
  const countryGovernorates = useMemo(
    () => GOVERNORATES.filter((g) => g.country === activeCountry),
    [activeCountry]
  );
  const featuredPresets = useMemo(
    () =>
      FEATURED_PRESET_IDS[activeCountry]
        .map((id) => GOVERNORATES.find((g) => g.id === id))
        .filter((g): g is (typeof GOVERNORATES)[number] => Boolean(g)),
    [activeCountry]
  );

  const handleSwitchCountry = (country: CountryCode) => {
    if (country === activeCountry) return;
    const defaultId = country === "US" ? "us_california" : "gharbia";
    handleSelectGovernorate(defaultId);
  };

  const activePathway = instantData.pathways[selectedPathwayId];
  const cashPathway = instantData.pathways.cash;
  const activePrevCrop = CROPS_MATRIX[prevCropId];
  const activePrevFamily = isAr
    ? activePrevCrop?.familyAr ?? ""
    : activePrevCrop?.family ?? "";

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-ground)] text-[var(--text-main)] transition-colors duration-200">
      <TopMissionBar
        governorateNameAr={instantData.governorate.nameAr}
        governorateNameEn={instantData.governorate.nameEn}
        coordinates={instantData.coordinates}
        thermalAnomalyC={instantData.multiScale.power.thermalAnomalyC}
        rootMoisturePct={instantData.multiScale.smap.rootMoisturePct}
        ureaSacksSaved={instantData.hudMetrics.ureaSacksSaved}
        waterSavedPct={instantData.hudMetrics.waterSavedPct}
        isLiveNasa={
          instantData.sourceStatus.powerLive || instantData.sourceStatus.asfLive
        }
        onOpenRawJson={() => setIsRawModalOpen(true)}
        onOpenPitchModal={() => setIsPitchModalOpen(true)}
      />

      <main className="mx-auto w-full max-w-[1440px] flex-1 p-4 lg:p-6 flex flex-col gap-5">
        {/* Global Dual-Region Switch Bar (Egypt & USA) */}
        <section
          aria-label={
            isAr
              ? "اختيار النطاق الجغرافي (مصر أو أمريكا)"
              : "Global Region Switch (Egypt or USA)"
          }
          className="hud-panel rounded-2xl p-4 lg:px-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5"
        >
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:flex items-center gap-2 w-full lg:w-auto"
            role="group"
            aria-label="Country Switch"
          >
            <button
              type="button"
              aria-pressed={activeCountry === "EG"}
              onClick={() => handleSwitchCountry("EG")}
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3.5 py-2 text-xs sm:text-sm font-bold transition-colors ${
                activeCountry === "EG"
                  ? "bg-emerald-500/20 text-emerald-800 border-emerald-500/70 dark:text-emerald-200 dark:border-emerald-400"
                  : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100 dark:bg-[#090f1b] dark:text-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
              }`}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 16"
                className="h-3.5 w-5 rounded-[2px] border border-black/15 shrink-0"
              >
                <rect width="24" height="5.33" y="0" fill="#ce1126" />
                <rect width="24" height="5.34" y="5.33" fill="#ffffff" />
                <rect width="24" height="5.33" y="10.67" fill="#000000" />
                <circle cx="12" cy="8" r="1.4" fill="#c09300" />
              </svg>
              <span>🇪🇬 مصر (النيل والدلتا)</span>
            </button>

            <button
              type="button"
              aria-pressed={activeCountry === "US"}
              onClick={() => handleSwitchCountry("US")}
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3.5 py-2 text-xs sm:text-sm font-bold transition-colors ${
                activeCountry === "US"
                  ? "bg-sky-500/20 text-sky-800 border-sky-500/70 dark:text-sky-200 dark:border-sky-400"
                  : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100 dark:bg-[#090f1b] dark:text-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
              }`}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 16"
                className="h-3.5 w-5 rounded-[2px] border border-black/15 shrink-0"
              >
                <rect width="24" height="16" fill="#ffffff" />
                <rect width="24" height="2" y="0" fill="#b22234" />
                <rect width="24" height="2" y="4" fill="#b22234" />
                <rect width="24" height="2" y="8" fill="#b22234" />
                <rect width="24" height="2" y="12" fill="#b22234" />
                <rect width="10" height="8" x="0" y="0" fill="#3c3b6e" />
              </svg>
              <span>🇺🇸 USA (California & Corn Belt)</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              {isAr ? "مناطق سريعة:" : "Quick Presets:"}
            </span>
            {featuredPresets.map((preset) => {
              const selected = govId === preset.id;
              return (
                <Button
                  key={preset.id}
                  size="sm"
                  variant={selected ? "solid" : "bordered"}
                  color={activeCountry === "US" ? "primary" : "success"}
                  aria-pressed={selected}
                  onPress={() => handleSelectGovernorate(preset.id)}
                  className={
                    selected
                      ? "font-bold text-xs"
                      : "border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium"
                  }
                >
                  {isAr ? preset.nameAr : preset.nameEn}
                </Button>
              );
            })}
            <Chip
              size="sm"
              variant="flat"
              color={activeCountry === "US" ? "primary" : "success"}
              className="font-bold text-[11px] tabular-telemetry"
            >
              {activeCountry === "US"
                ? "$ USD / Acre"
                : isAr
                ? "ج.م / فدان"
                : "EGP / Feddan"}
            </Chip>
          </div>
        </section>

        {/* Step 1 & Step 2 Row */}
        <div className="grid grid-cols-12 gap-4 items-stretch">
          {/* Step 1: Location & Previous Crop */}
          <section
            aria-label={
              isAr
                ? "الخطوة الأولى: أرضك والمحصول السابق"
                : "Step 1: Your Land & Previous Crop"
            }
            className="col-span-12 lg:col-span-7 hud-panel rounded-2xl p-4 lg:p-5 flex flex-col gap-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Compass className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <h1 className="text-base font-bold text-slate-900 dark:text-slate-50">
                  {isAr
                    ? "١. أرضك والمحصول السابق"
                    : "1. Your Land & Previous Crop"}
                </h1>
              </div>
              <span className="text-xs text-slate-600 dark:text-slate-400">
                {isAr
                  ? `تربة ${instantData.governorate.soilTypeAr}`
                  : `Soil: ${instantData.governorate.soilTypeEn}`}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 items-end">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2 text-xs text-slate-800 dark:text-slate-200">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <MapPin className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    {activeCountry === "US"
                      ? isAr
                        ? "الإقليم الأمريكي (أو اضغط الخريطة)"
                        : "US Region (or click map)"
                      : isAr
                      ? "المحافظة المصرية (أو اضغط الخريطة)"
                      : "Egyptian Governorate (or click map)"}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
                    {isAr
                      ? instantData.governorate.regionAr
                      : instantData.governorate.regionEn}
                  </span>
                </div>

                <Select
                  aria-label={
                    activeCountry === "US"
                      ? isAr
                        ? "اختر الإقليم الأمريكي"
                        : "Select US Agricultural Region"
                      : isAr
                      ? "اختر المحافظة المصرية"
                      : "Select Egyptian Governorate"
                  }
                  size="sm"
                  variant="bordered"
                  selectedKeys={[govId]}
                  onSelectionChange={(keys) => {
                    const first = Array.from(keys)[0];
                    if (typeof first === "string") {
                      handleSelectGovernorate(first);
                    }
                  }}
                  startContent={
                    <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  }
                  classNames={{
                    trigger:
                      "h-8 min-h-8 bg-slate-50 dark:bg-[#090f1b] border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700",
                    value:
                      "text-slate-900 dark:text-slate-100 font-semibold text-xs",
                    popoverContent:
                      "bg-white dark:bg-[#0d1421] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100",
                  }}
                >
                {countryGovernorates.map((gov) => (
                  <SelectItem
                    key={gov.id}
                    textValue={isAr ? gov.nameAr : gov.nameEn}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">
                        {isAr ? gov.nameAr : gov.nameEn}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {isAr ? gov.regionAr : gov.regionEn}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2 text-xs text-slate-800 dark:text-slate-200">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <Sprout className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    {isAr ? "المحصول السابق" : "Previous Crop"}
                  </span>
                  <Chip
                    size="sm"
                    variant="flat"
                    className="h-5 text-[11px] bg-slate-200 text-slate-800 dark:bg-slate-800/80 dark:text-slate-300"
                  >
                    {isAr
                      ? `العائلة ${activePrevFamily}`
                      : `Family: ${activePrevFamily}`}
                  </Chip>
                </div>

                <ButtonGroup fullWidth size="sm" variant="bordered">
                  {PREVIOUS_CROPS.map((crop) => {
                    const active = prevCropId === crop.id;
                    return (
                      <Button
                        key={crop.id}
                        aria-pressed={active}
                        onPress={() => setPrevCropId(crop.id)}
                        className={
                          active
                            ? "bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/60 font-bold"
                            : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100 dark:bg-[#090f1b] dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800/70"
                        }
                      >
                        {isAr ? crop.labelAr : crop.labelEn}
                      </Button>
                    );
                  })}
                </ButtonGroup>
              </div>
            </div>

            <FarmMap
              lat={instantData.coordinates.lat}
              lon={instantData.coordinates.lon}
              governorateNameAr={instantData.governorate.nameAr}
              governorateNameEn={instantData.governorate.nameEn}
              ndviValue={instantData.multiScale.modis.ndviValue}
              onSelectLocation={handleMapClick}
            />
          </section>

          {/* Step 2: Climate Stress Testing + Multi-Scale Telemetry */}
          <section
            aria-label={
              isAr
                ? "الخطوة الثانية: اختبار ظروف المناخ"
                : "Step 2: Climate Stress Testing"
            }
            className="col-span-12 lg:col-span-5 hud-panel rounded-2xl p-4 lg:p-5 flex flex-col justify-between gap-4"
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">
                    {isAr ? "٢. اختبار ظروف المناخ" : "2. Climate Stress Testing"}
                  </h2>
                </div>
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {isAr
                    ? "جرّب صدمات الحر والمياه"
                    : "Simulate heat & water shocks"}
                </span>
              </div>

              <StressSliders
                prevCropId={prevCropId}
                heatStressC={heatStressC}
                waterDeficitPct={waterDeficitPct}
                onHeatStressChange={setHeatStressC}
                onWaterDeficitChange={setWaterDeficitPct}
                showPrevCrop={false}
              />
            </div>

            <MultiScaleTabs telemetry={instantData.multiScale} />
          </section>
        </div>

        {/* Step 3: Compare & Choose Pathway (3 Consecutive Seasons) */}
        <section
          aria-label={
            isAr
              ? "الخطوة الثالثة: قارن واختار مسارك"
              : "Step 3: Compare & Choose Your Pathway"
          }
          className="hud-panel rounded-2xl p-4 lg:p-5 flex flex-col gap-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <GitCompareArrows className="h-5 w-5 text-sky-600 dark:text-sky-400 shrink-0" />
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">
                {isAr
                  ? "٣. قارن واختار مسارك (3 مواسم متتالية)"
                  : "3. Compare & Choose Your Pathway (3 Consecutive Seasons)"}
              </h2>
            </div>
            <span className="text-xs text-slate-600 dark:text-slate-400">
              {isAr
                ? "اضغط على أي مسار لمقارنة المكاسب والمخاطر عبر 10 سنوات من بيانات ناسا"
                : "Select any pathway to reveal 10-year NASA climate tradeoffs and risk bands"}
            </span>
          </div>

          <PathwayCards
            pathways={instantData.pathways}
            selectedPathwayId={selectedPathwayId}
            onSelectPathway={setSelectedPathwayId}
            country={activeCountry}
          />

          <div className="grid grid-cols-12 gap-4 items-start pt-1">
            <div className="col-span-12 lg:col-span-5">
              <TradeoffRadar
                selectedPathway={activePathway}
                cashPathway={cashPathway}
              />
            </div>

            <div className="col-span-12 lg:col-span-7">
              <UncertaintyBands
                selectedPathway={activePathway}
                cashPathway={cashPathway}
                annualRecords={instantData.annualRecords}
                country={activeCountry}
              />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 items-start pt-1">
            <div className="col-span-12 lg:col-span-6">
              <AiCopilotCard
                copilot={copilot}
                loading={copilotLoading}
                onRefresh={() => fetchCopilot(instantData)}
              />
            </div>

            <div className="col-span-12 lg:col-span-6">
              <FieldGrid3x3 pathway={activePathway} country={activeCountry} />
            </div>
          </div>
        </section>
      </main>

      <RawJsonModal
        isOpen={isRawModalOpen}
        onOpenChange={setIsRawModalOpen}
        rawJson={instantData.rawJson}
        sourceLabelAr={instantData.sourceStatus.modeLabelAr}
        sourceLabelEn={instantData.sourceStatus.modeLabelEn}
        powerLive={instantData.sourceStatus.powerLive}
        asfLive={instantData.sourceStatus.asfLive}
      />

      <PitchModal
        isOpen={isPitchModalOpen}
        onOpenChange={setIsPitchModalOpen}
      />
    </div>
  );
}
