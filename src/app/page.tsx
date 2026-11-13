"use client";

import { Select, SelectItem, Skeleton } from "@heroui/react";
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
import { CROPS_MATRIX, PreviousCropId } from "@/data/cropsMatrix";
import { findNearestGovernorate, GOVERNORATES } from "@/data/governorates";
import {
  buildRawNasaPayload,
  getFallbackAnnualClimate,
  getFallbackMultiScale,
} from "@/data/nasaFallback";
import { PathwayId, runFieldShiftSimulation } from "@/lib/simulationEngine";
import { CopilotApiResponse, FieldShiftApiResponse } from "@/types/fieldShift";
import { Compass, LineChart, MapPin, SlidersHorizontal } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const FarmMap = dynamic(() => import("@/components/map/FarmMap"), {
  ssr: false,
  loading: () => (
    <Skeleton className="h-[240px] w-full rounded-xl bg-slate-900 border border-slate-800" />
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
      modeLabelAr: "جاري التحميل من أقمار ناسا...",
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
            governorateNameAr: simState.governorate.nameAr,
            prevCropNameAr: prevCrop.nameAr,
            heatStressC: simState.heatStressC,
            waterDeficitPct: simState.waterDeficitPct,
            selectedPathway: {
              id: selected.id,
              titleAr: selected.titleAr,
              seasonsNamesAr: selected.seasons.map((s) => s.nameAr),
              p10Egp: selected.p10Egp,
              p50Egp: selected.p50Egp,
              p90Egp: selected.p90Egp,
              cvPct: selected.cvPct,
              ureaSacksSaved: selected.ureaSacksSaved,
              waterSavedPct: selected.waterSavedPct,
              hasFamilyConflict: selected.hasFamilyConflict,
              conflictDetailsAr: selected.conflictDetailsAr,
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
          setCopilot({
            mode: "offline-agronomic-advisor",
            headlineAr: `ملخص القرار في ${simState.governorate.nameAr}`,
            adviceAr: `المسار المختار (${selected.titleAr}) بيحقق متوسط ربح ${selected.p50Egp.toLocaleString(
              "en-US"
            )} جنيه/فدان مع توفير ${selected.ureaSacksSaved} شكارة يوريا و${selected.waterSavedPct}% من مياه الري.`,
            actionChecklistAr: [
              `حافظ على تنويع العائلة النباتية بعد ${prevCrop.nameAr}.`,
              `استعد لموجة حر +${simState.heatStressC}°C بمتابعة رطوبة الجذور SMAP.`,
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

  // Sync live NASA POWER & ASF data from /api/field-shift when coordinates/gov change
  useEffect(() => {
    const timer = setTimeout(async () => {
      fieldAbortRef.current?.abort();
      const controller = new AbortController();
      fieldAbortRef.current = controller;

      try {
        const res = await fetch("/api/field-shift", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            govId,
            lat: coords.lat,
            lon: coords.lon,
            prevCropId,
            heatStressC,
            waterDeficitPct,
            selectedPathway: selectedPathwayId,
          }),
        });

        if (!res.ok) return;
        const json = (await res.json()) as FieldShiftApiResponse;
        setData(json);
      } catch {
        // Keep instant local state if aborted or offline
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [govId, coords.lat, coords.lon, prevCropId, heatStressC, waterDeficitPct, selectedPathwayId]);

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

  const activePathway = instantData.pathways[selectedPathwayId];
  const cashPathway = instantData.pathways.cash;

  return (
    <div className="min-h-screen flex flex-col bg-[#070b12] text-slate-100">
      <TopMissionBar
        soilHealthScore={instantData.hudMetrics.soilHealthScore}
        colorTheme={instantData.hudMetrics.colorTheme}
        ureaSacksSaved={instantData.hudMetrics.ureaSacksSaved}
        waterSavedPct={instantData.hudMetrics.waterSavedPct}
        governorateNameAr={instantData.governorate.nameAr}
        coordinates={instantData.coordinates}
        isLiveNasa={
          instantData.sourceStatus.powerLive || instantData.sourceStatus.asfLive
        }
        onOpenRawJson={() => setIsRawModalOpen(true)}
        onOpenPitchModal={() => setIsPitchModalOpen(true)}
      />

      <main className="mx-auto w-full max-w-[1600px] flex-1 p-3 lg:p-4">
        <div className="grid grid-cols-12 gap-3.5 items-start">
          {/* Right Column: Satellite Map & Multi-Scale Observations */}
          <section
            aria-label="الخريطة الفضائية ومقاييس الرصد"
            className="col-span-12 lg:col-span-4 hud-panel rounded-xl p-3.5 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-sky-400" />
                <h1 className="text-sm font-bold text-slate-100">
                  الرصد الفضائي متعدد المقاييس
                </h1>
              </div>
              <span className="text-[11px] text-slate-400">
                {instantData.governorate.soilTypeAr}
              </span>
            </div>

            <Select
              label="اختر المحافظة الزراعية"
              size="sm"
              variant="bordered"
              selectedKeys={[govId]}
              onSelectionChange={(keys) => {
                const first = Array.from(keys)[0];
                if (typeof first === "string") {
                  handleSelectGovernorate(first);
                }
              }}
              startContent={<MapPin className="h-4 w-4 text-emerald-400" />}
              classNames={{
                trigger: "bg-[#090f1b] border-slate-800 hover:border-slate-700",
                label: "text-slate-400 text-xs",
                value: "text-slate-100 font-semibold text-xs",
                popoverContent: "bg-[#0d1421] border border-slate-700 text-slate-100",
              }}
            >
              {GOVERNORATES.map((gov) => (
                <SelectItem key={gov.id} textValue={gov.nameAr}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold">{gov.nameAr}</span>
                    <span className="text-xs text-slate-400">{gov.regionAr}</span>
                  </div>
                </SelectItem>
              ))}
            </Select>

            <FarmMap
              lat={instantData.coordinates.lat}
              lon={instantData.coordinates.lon}
              governorateNameAr={instantData.governorate.nameAr}
              ndviValue={instantData.multiScale.modis.ndviValue}
              onSelectLocation={handleMapClick}
            />

            <MultiScaleTabs telemetry={instantData.multiScale} />
          </section>

          {/* Center Column: Pathway Comparison, Stress Simulator & 3x3 Field Grid */}
          <section
            aria-label="مقارنة المسارات ومحاكاة الصدمات"
            className="col-span-12 lg:col-span-4 hud-panel rounded-xl p-3.5 flex flex-col gap-3.5"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-amber-400" />
                <h2 className="text-sm font-bold text-slate-100">
                  مقارنة الدورات الزراعية واختبار الإجهاد
                </h2>
              </div>
              <span className="text-[11px] text-slate-400">3 مواسم متتالية</span>
            </div>

            <StressSliders
              prevCropId={prevCropId}
              heatStressC={heatStressC}
              waterDeficitPct={waterDeficitPct}
              onPrevCropChange={setPrevCropId}
              onHeatStressChange={setHeatStressC}
              onWaterDeficitChange={setWaterDeficitPct}
            />

            <PathwayCards
              pathways={instantData.pathways}
              selectedPathwayId={selectedPathwayId}
              onSelectPathway={setSelectedPathwayId}
            />

            <FieldGrid3x3 pathway={activePathway} />
          </section>

          {/* Left Column: Tradeoff Radar, P10/P50/P90 Uncertainty & AI Copilot */}
          <section
            aria-label="مخطط المفاضلات ونطاقات عدم اليقين والمستشار الذكي"
            className="col-span-12 lg:col-span-4 hud-panel rounded-xl p-3.5 flex flex-col gap-3.5"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <LineChart className="h-4 w-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-slate-100">
                  كشف المفاضلات وعدم اليقين والمستشار الذكي
                </h2>
              </div>
              <span className="text-[11px] text-slate-400 tabular-telemetry">
                2015–2024
              </span>
            </div>

            <TradeoffRadar
              selectedPathway={activePathway}
              cashPathway={cashPathway}
            />

            <UncertaintyBands
              selectedPathway={activePathway}
              cashPathway={cashPathway}
              annualRecords={instantData.annualRecords}
            />

            <AiCopilotCard
              copilot={copilot}
              loading={copilotLoading}
              onRefresh={() => fetchCopilot(instantData)}
            />
          </section>
        </div>
      </main>

      <RawJsonModal
        isOpen={isRawModalOpen}
        onOpenChange={setIsRawModalOpen}
        rawJson={instantData.rawJson}
        sourceLabelAr={instantData.sourceStatus.modeLabelAr}
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

