import { NextRequest, NextResponse } from "next/server";
import { PreviousCropId } from "@/data/cropsMatrix";
import { findNearestGovernorate, GOVERNORATES } from "@/data/governorates";
import {
  AnnualClimateRecord,
  buildRawNasaPayload,
  getFallbackAnnualClimate,
  getFallbackMultiScale,
} from "@/data/nasaFallback";
import { PathwayId, runFieldShiftSimulation } from "@/lib/simulationEngine";

function parseYearFromPowerKey(key: string): number | null {
  if (/^\d{6}$/.test(key)) {
    const month = Number(key.slice(4, 6));
    if (month >= 1 && month <= 12) {
      return Number(key.slice(0, 4));
    }
  }
  return null;
}

function parseNasaPowerAnnualRecords(
  powerJson: unknown,
  fallbackRecords: AnnualClimateRecord[]
): AnnualClimateRecord[] | null {
  try {
    const params = (
      powerJson as {
        properties?: {
          parameter?: {
            T2M?: Record<string, number>;
            GWETROOT?: Record<string, number>;
            ALLSKY_SFC_SW_DWN?: Record<string, number>;
            PRECTOTCORR?: Record<string, number>;
          };
        };
      }
    )?.properties?.parameter;

    if (!params?.T2M) return null;

    const yearBuckets: Record<
      number,
      { t2m: number[]; gwetRoot: number[]; solar: number[]; precip: number[] }
    > = {};

    for (const [key, val] of Object.entries(params.T2M)) {
      const year = parseYearFromPowerKey(key);
      if (!year || val < -50 || val > 70) continue;
      if (!yearBuckets[year]) {
        yearBuckets[year] = { t2m: [], gwetRoot: [], solar: [], precip: [] };
      }
      yearBuckets[year].t2m.push(val);

      const gwetVal = params.GWETROOT?.[key];
      if (typeof gwetVal === "number" && gwetVal >= 0 && gwetVal <= 1) {
        yearBuckets[year].gwetRoot.push(gwetVal);
      }

      const solarVal = params.ALLSKY_SFC_SW_DWN?.[key];
      if (typeof solarVal === "number" && solarVal >= 0 && solarVal < 20) {
        yearBuckets[year].solar.push(solarVal);
      }

      const precipVal = params.PRECTOTCORR?.[key];
      if (typeof precipVal === "number" && precipVal >= 0 && precipVal < 100) {
        yearBuckets[year].precip.push(precipVal);
      }
    }

    const years = Object.keys(yearBuckets)
      .map(Number)
      .filter((y) => y >= 2015 && y <= 2024)
      .sort((a, b) => a - b);

    if (years.length < 8) return null;

    const avg = (arr: number[], dflt: number) =>
      arr.length > 0 ? arr.reduce((s, n) => s + n, 0) / arr.length : dflt;

    const rawMeans = years.map((y, idx) => {
      const fb = fallbackRecords[idx] ?? fallbackRecords[0];
      return {
        year: y,
        t2mMeanC: Number(avg(yearBuckets[y].t2m, fb.t2mMeanC).toFixed(2)),
        gwetRoot: Number(avg(yearBuckets[y].gwetRoot, fb.gwetRoot).toFixed(2)),
        solarRadiationKwhM2Day: Number(
          avg(yearBuckets[y].solar, fb.solarRadiationKwhM2Day).toFixed(2)
        ),
        precipMmDay: Number(avg(yearBuckets[y].precip, fb.precipMmDay).toFixed(3)),
        fb,
      };
    });

    const tenYearMean =
      rawMeans.reduce((s, r) => s + r.t2mMeanC, 0) / rawMeans.length;

    return rawMeans.map((r) => {
      const tempAnomalyC = Number((r.t2mMeanC - tenYearMean).toFixed(2));
      const moistureIndex = Number(
        Math.min(
          1.12,
          Math.max(0.45, r.gwetRoot + 0.45 - tempAnomalyC * 0.04)
        ).toFixed(2)
      );
      return {
        year: r.year,
        t2mMeanC: r.t2mMeanC,
        gwetRoot: r.gwetRoot,
        solarRadiationKwhM2Day: r.solarRadiationKwhM2Day,
        precipMmDay: r.precipMmDay,
        tempAnomalyC,
        moistureIndex,
      };
    });
  } catch {
    return null;
  }
}

async function handleFieldShift(params: {
  govId?: string;
  lat?: number;
  lon?: number;
  prevCropId?: string;
  heatStressC?: number;
  waterDeficitPct?: number;
  selectedPathway?: string;
}) {
  const matchedGov =
    GOVERNORATES.find((g) => g.id === params.govId) ??
    (typeof params.lat === "number" && typeof params.lon === "number"
      ? findNearestGovernorate(params.lat, params.lon)
      : GOVERNORATES[0]);

  const lat =
    typeof params.lat === "number" && !Number.isNaN(params.lat)
      ? params.lat
      : matchedGov.lat;
  const lon =
    typeof params.lon === "number" && !Number.isNaN(params.lon)
      ? params.lon
      : matchedGov.lon;

  const validPrevCrops: PreviousCropId[] = ["wheat", "potato", "tomato", "maize"];
  const prevCropId: PreviousCropId = validPrevCrops.includes(
    params.prevCropId as PreviousCropId
  )
    ? (params.prevCropId as PreviousCropId)
    : "wheat";

  const heatStressC = Math.min(4.5, Math.max(0, Number(params.heatStressC ?? 1.5)));
  const waterDeficitPct = Math.min(
    45,
    Math.max(0, Number(params.waterDeficitPct ?? 15))
  );

  const selectedPathwayId: PathwayId =
    params.selectedPathway === "cash" || params.selectedPathway === "resilient"
      ? params.selectedPathway
      : "balanced";

  const fallbackAnnual = getFallbackAnnualClimate(matchedGov, lat, lon);

  const powerEndpoint = `https://power.larc.nasa.gov/api/temporal/monthly/point?parameters=T2M,GWETROOT,ALLSKY_SFC_SW_DWN,PRECTOTCORR&community=AG&longitude=${lon.toFixed(
    4
  )}&latitude=${lat.toFixed(4)}&start=2015&end=2024&format=JSON`;

  const asfEndpoint = `https://api.daac.asf.alaska.edu/services/search/param?platform=Sentinel-1&intersectsWith=POINT(${lon.toFixed(
    4
  )}%20${lat.toFixed(4)})&maxResults=1&output=json`;

  let powerLive = false;
  let asfLive = false;
  let annualRecords = fallbackAnnual;
  let livePowerRaw: unknown = undefined;
  let liveAsfRaw: unknown = undefined;
  let liveAsfMeta:
    | { granuleName?: string; acquisitionDate?: string; polarization?: string }
    | undefined = undefined;

  const powerController = new AbortController();
  const powerTimeout = setTimeout(() => powerController.abort(), 6000);
  const asfController = new AbortController();
  const asfTimeout = setTimeout(() => asfController.abort(), 6000);

  const [powerSettled, asfSettled] = await Promise.allSettled([
    fetch(powerEndpoint, {
      next: { revalidate: 86400 },
      signal: powerController.signal,
    }).finally(() => clearTimeout(powerTimeout)),
    fetch(asfEndpoint, {
      next: { revalidate: 86400 },
      signal: asfController.signal,
    }).finally(() => clearTimeout(asfTimeout)),
  ]);

  if (powerSettled.status === "fulfilled" && powerSettled.value.ok) {
    try {
      const json = await powerSettled.value.json();
      const parsed = parseNasaPowerAnnualRecords(json, fallbackAnnual);
      if (parsed) {
        annualRecords = parsed;
        powerLive = true;
        livePowerRaw = {
          geometry: json.geometry,
          header: json.header,
          parametersPreview: {
            T2M: Object.fromEntries(
              Object.entries(json.properties?.parameter?.T2M ?? {}).slice(-12)
            ),
            GWETROOT: Object.fromEntries(
              Object.entries(json.properties?.parameter?.GWETROOT ?? {}).slice(-12)
            ),
          },
        };
      }
    } catch {
      // Fallback safely to nasaFallback.ts
    }
  }

  if (asfSettled.status === "fulfilled" && asfSettled.value.ok) {
    try {
      const asfJson = await asfSettled.value.json();
      const firstGranule = Array.isArray(asfJson)
        ? asfJson[0]?.[0] ?? asfJson[0]
        : null;
      if (firstGranule && typeof firstGranule === "object") {
        asfLive = true;
        liveAsfRaw = firstGranule;
        liveAsfMeta = {
          granuleName: String(
            firstGranule.granuleName ?? firstGranule.sceneName ?? "Sentinel-1"
          ),
          acquisitionDate: String(
            firstGranule.startTime ?? firstGranule.stopTime ?? "2024-05-04T15:51:12Z"
          ),
          polarization: String(firstGranule.polarization ?? "VV+VH"),
        };
      }
    } catch {
      // Fallback safely to nasaFallback.ts
    }
  }

  const multiScale = getFallbackMultiScale(
    matchedGov,
    annualRecords,
    lat,
    lon,
    liveAsfMeta
  );

  const pathways = runFieldShiftSimulation({
    gov: matchedGov,
    prevCropId,
    heatStressC,
    waterDeficitPct,
    annualRecords,
  });

  const activePathway = pathways[selectedPathwayId];

  const rawJson = buildRawNasaPayload({
    gov: matchedGov,
    lat,
    lon,
    annualRecords,
    multiScale,
    powerLive,
    asfLive,
    powerEndpoint,
    asfEndpoint,
    rawPowerSnippet: livePowerRaw,
    rawAsfSnippet: liveAsfRaw,
  });

  return NextResponse.json({
    governorate: matchedGov,
    coordinates: { lat: Number(lat.toFixed(4)), lon: Number(lon.toFixed(4)) },
    prevCropId,
    heatStressC,
    waterDeficitPct,
    selectedPathwayId,
    multiScale,
    annualRecords,
    pathways,
    hudMetrics: {
      soilHealthScore: activePathway.soilHealthScore,
      ureaSacksSaved: activePathway.ureaSacksSaved,
      waterSavedPct: activePathway.waterSavedPct,
      colorTheme: activePathway.colorTheme,
    },
    sourceStatus: {
      powerLive,
      asfLive,
      modeLabelAr:
        powerLive || asfLive
          ? "متصل ببيانات ناسا الحية"
          : matchedGov.country === "US"
          ? "بيانات الحزام الزراعي الأمريكي المحفوظة (Offline Fallback)"
          : "بيانات دلتا النيل المحفوظة (Offline Fallback)",
      modeLabelEn:
        powerLive || asfLive
          ? "Connected to Live NASA Data"
          : matchedGov.country === "US"
          ? "Cached US Climate Baseline (Offline Fallback)"
          : "Cached Nile Delta Climate Baseline (Offline Fallback)",
    },
    rawJson,
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const prevCrop =
    searchParams.get("prev_crop") ?? searchParams.get("prevCropId") ?? undefined;
  const heatRaw =
    searchParams.get("heat_shock_c") ?? searchParams.get("heatStressC");
  const waterRaw =
    searchParams.get("water_deficit_pct") ?? searchParams.get("waterDeficitPct");

  return handleFieldShift({
    govId: searchParams.get("govId") ?? undefined,
    lat: searchParams.has("lat") ? Number(searchParams.get("lat")) : undefined,
    lon: searchParams.has("lon") ? Number(searchParams.get("lon")) : undefined,
    prevCropId: prevCrop,
    heatStressC: heatRaw !== null ? Number(heatRaw) : undefined,
    waterDeficitPct: waterRaw !== null ? Number(waterRaw) : undefined,
    selectedPathway: searchParams.get("selectedPathway") ?? undefined,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return handleFieldShift({
      govId: body?.govId,
      lat: body?.lat,
      lon: body?.lon,
      prevCropId: body?.prev_crop ?? body?.prevCropId,
      heatStressC: body?.heat_shock_c ?? body?.heatStressC,
      waterDeficitPct: body?.water_deficit_pct ?? body?.waterDeficitPct,
      selectedPathway: body?.selectedPathway,
    });
  } catch {
    return handleFieldShift({});
  }
}
