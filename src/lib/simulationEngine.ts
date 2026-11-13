import {
  CROPS_MATRIX,
  CropInfo,
  PreviousCropId,
} from "@/data/cropsMatrix";
import { GovernorateInfo } from "@/data/governorates";
import { AnnualClimateRecord } from "@/data/nasaFallback";

export type PathwayId = "balanced" | "cash" | "resilient";

export interface RadarScores {
  cashReturn: number;
  waterSaving: number;
  nitrogenCharge: number;
  heatResilience: number;
  pestBreak: number;
}

export interface FieldPlotCell {
  index: number;
  labelAr: string;
  season1Crop: CropInfo;
  season2Crop: CropInfo;
  season3Crop: CropInfo;
  hasConflict: boolean;
  conflictReasonAr: string | null;
  nitrogenBalanceKg: number;
  waterDemandM3: number;
  healthScore: number;
}

export interface PathwaySimulationResult {
  id: PathwayId;
  titleAr: string;
  badgeAr: string;
  summaryAr: string;
  colorTheme: "success" | "danger" | "primary";
  seasons: [CropInfo, CropInfo, CropInfo];
  hasFamilyConflict: boolean;
  conflictDetailsAr: string | null;
  p10Egp: number;
  p50Egp: number;
  p90Egp: number;
  cvPct: number;
  annualProfitsEgp: number[];
  ureaSacksSaved: number;
  waterSavedPct: number;
  totalWaterM3: number;
  netNitrogenKg: number;
  soilHealthScore: number;
  radar: RadarScores;
  fieldGrid: FieldPlotCell[];
}

export interface SimulationInput {
  gov: GovernorateInfo;
  prevCropId: PreviousCropId;
  heatStressC: number;
  waterDeficitPct: number;
  annualRecords: AnnualClimateRecord[];
}

function getPathwayCropIds(
  prevCropId: PreviousCropId
): Record<PathwayId, [string, string, string]> {
  switch (prevCropId) {
    case "potato":
      return {
        balanced: ["berseem", "maize", "fava"],
        cash: ["tomato", "potato", "tomato"],
        resilient: ["fava", "sunflower", "sugarbeet"],
      };
    case "tomato":
      return {
        balanced: ["fava", "maize", "berseem"],
        cash: ["potato", "tomato", "potato"],
        resilient: ["peanut", "sugarbeet", "sunflower"],
      };
    case "maize":
      return {
        balanced: ["berseem", "soybean", "sugarbeet"],
        cash: ["wheat", "maize", "potato"],
        resilient: ["fava", "sunflower", "peanut"],
      };
    case "wheat":
    default:
      return {
        balanced: ["soybean", "sugarbeet", "berseem"],
        cash: ["maize", "potato", "wheat"],
        resilient: ["peanut", "sunflower", "fava"],
      };
  }
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

function detectFamilyConflict(
  prevCrop: CropInfo,
  seasons: [CropInfo, CropInfo, CropInfo]
): { hasConflict: boolean; detailsAr: string | null } {
  const sequence = [prevCrop, ...seasons];
  for (let i = 1; i < sequence.length; i++) {
    if (sequence[i].family === sequence[i - 1].family) {
      return {
        hasConflict: true,
        detailsAr: `تعارض نباتي: تكرار العائلة ${sequence[i].familyAr} (${sequence[i - 1].nameAr} ← ${sequence[i].nameAr}) يرفع مخاطر الآفات والنيمانودا (-22% من الإنتاج).`,
      };
    }
  }
  const families = new Set(seasons.map((c) => c.family));
  if (families.size < 3 && seasons.some((c) => c.family === prevCrop.family)) {
    return {
      hasConflict: true,
      detailsAr: `تداخل في العائلة ${prevCrop.familyAr} خلال 3 مواسم يضعف خصوبة التربة.`,
    };
  }
  return { hasConflict: false, detailsAr: null };
}

function buildFieldGrid(
  seasons: [CropInfo, CropInfo, CropInfo],
  prevCrop: CropInfo,
  hasConflict: boolean,
  soilHealthScore: number,
  heatStressC: number,
  waterDeficitPct: number
): FieldPlotCell[] {
  const sectorLabels = [
    "حوض ١ - شمال شرق",
    "حوض ٢ - شمال وسط",
    "حوض ٣ - شمال غرب",
    "حوض ٤ - قلب الفدان",
    "حوض ٥ - المروى الرئيسي",
    "حوض ٦ - وسط غرب",
    "حوض ٧ - جنوب شرق",
    "حوض ٨ - جنوب وسط",
    "حوض ٩ - مصرف الحقل",
  ];

  return sectorLabels.map((labelAr, idx) => {
    // Minor spatial heterogeneity across the 9 sub-plots of the feddan
    const microFactor = idx === 4 ? 1.04 : idx === 8 ? 0.94 : 0.97 + (idx % 3) * 0.025;
    const netN = Math.round(
      ((seasons[0].nitrogenKgPerFeddan +
        seasons[1].nitrogenKgPerFeddan +
        seasons[2].nitrogenKgPerFeddan) /
        3) *
        microFactor
    );
    const totalWater = Math.round(
      ((seasons[0].waterM3PerFeddan +
        seasons[1].waterM3PerFeddan +
        seasons[2].waterM3PerFeddan) /
        3) *
        (1 - waterDeficitPct / 150)
    );
    const stressPenalty = Math.round(heatStressC * 2.5 + waterDeficitPct * 0.18);
    const cellHealth = clamp(
      Math.round(soilHealthScore * microFactor - (hasConflict ? 14 : 0) - stressPenalty * 0.25),
      18,
      98
    );

    const plotConflict =
      hasConflict && (seasons[0].family === prevCrop.family || seasons[1].family === seasons[0].family);

    return {
      index: idx + 1,
      labelAr,
      season1Crop: seasons[0],
      season2Crop: seasons[1],
      season3Crop: seasons[2],
      hasConflict: plotConflict,
      conflictReasonAr: plotConflict
        ? `تراكم أمراض العائلة ${seasons[0].familyAr} في التربة`
        : null,
      nitrogenBalanceKg: netN,
      waterDemandM3: totalWater,
      healthScore: cellHealth,
    };
  });
}

export function runFieldShiftSimulation(
  input: SimulationInput
): Record<PathwayId, PathwaySimulationResult> {
  const { gov, prevCropId, heatStressC, waterDeficitPct, annualRecords } = input;
  const prevCrop = CROPS_MATRIX[prevCropId];
  const mapping = getPathwayCropIds(prevCropId);

  // First pass: compute raw metrics for each pathway so savings can compare against Cash pathway
  const rawResults: Record<
    PathwayId,
    {
      seasons: [CropInfo, CropInfo, CropInfo];
      annualProfitsEgp: number[];
      totalWaterM3: number;
      netNitrogenKg: number;
      hasConflict: boolean;
      conflictDetailsAr: string | null;
      avgPestBreak: number;
      avgHeatTolerance: number;
    }
  > = {} as never;

  const pathwayOrder: PathwayId[] = ["balanced", "cash", "resilient"];

  for (const pid of pathwayOrder) {
    const ids = mapping[pid];
    const seasons: [CropInfo, CropInfo, CropInfo] = [
      CROPS_MATRIX[ids[0]],
      CROPS_MATRIX[ids[1]],
      CROPS_MATRIX[ids[2]],
    ];

    const conflict = detectFamilyConflict(prevCrop, seasons);
    const totalWaterM3 = Math.round(
      seasons.reduce((sum, c) => sum + c.waterM3PerFeddan, 0) * gov.waterStressFactor
    );
    const netNitrogenKg = seasons.reduce(
      (sum, c) => sum + c.nitrogenKgPerFeddan,
      0
    );
    const avgPestBreak =
      seasons.reduce((sum, c) => sum + c.pestBreakScore, 0) / 3;
    const avgHeatTolerance =
      seasons.reduce((sum, c) => sum + c.heatToleranceC, 0) / 3;

    // Simulate 10 historical years (2015-2024) + user stress sliders
    const annualProfitsEgp = annualRecords.map((yearRec) => {
      let seasonSum = 0;

      for (let sIdx = 0; sIdx < seasons.length; sIdx++) {
        const crop = seasons[sIdx];
        const effectiveHeatC = Math.max(0, yearRec.tempAnomalyC + heatStressC);
        const heatExcess = Math.max(0, effectiveHeatC - crop.heatToleranceC);
        const heatPenalty = Math.min(0.46, heatExcess * 0.145);

        // Dry year amplifies water deficit
        const effectiveWaterDeficit =
          waterDeficitPct + (1 - yearRec.moistureIndex) * 14;
        const droughtExcess = Math.max(
          0,
          effectiveWaterDeficit - crop.droughtTolerancePct
        );
        const droughtPenalty = Math.min(0.48, droughtExcess * 0.013);

        // Nitrogen fertilization cost/saving (Urea 46% cost ~ 950 EGP/50kg sack = 23kg N)
        const nAdjustmentEgp =
          crop.nitrogenKgPerFeddan > 0
            ? crop.nitrogenKgPerFeddan * 44
            : crop.nitrogenKgPerFeddan * 38;

        // Progressive soil fatigue penalty on Cash rotation
        const sequenceConflictPenalty = conflict.hasConflict
          ? 0.21 + sIdx * 0.04
          : 0;

        // Deep root bonus in water-stressed years
        const rootResilienceBonus =
          crop.rootDepthCm >= 120 && waterDeficitPct >= 15 ? 0.07 : 0;

        const yieldMultiplier = clamp(
          1 -
            heatPenalty -
            droughtPenalty -
            sequenceConflictPenalty +
            rootResilienceBonus,
          0.32,
          1.14
        );

        const seasonProfit = crop.baseProfitEgp * yieldMultiplier + nAdjustmentEgp;
        seasonSum += seasonProfit;
      }

      return Math.round(seasonSum);
    });

    rawResults[pid] = {
      seasons,
      annualProfitsEgp,
      totalWaterM3,
      netNitrogenKg,
      hasConflict: conflict.hasConflict,
      conflictDetailsAr: conflict.detailsAr,
      avgPestBreak,
      avgHeatTolerance,
    };
  }

  const cashWaterM3 = rawResults.cash.totalWaterM3;
  const cashNitrogenKg = rawResults.cash.netNitrogenKg;

  const metaByPathway: Record<
    PathwayId,
    { titleAr: string; badgeAr: string; summaryAr: string; colorTheme: "success" | "danger" | "primary" }
  > = {
    balanced: {
      titleAr: "المسار المتوازن الذكي",
      badgeAr: "موصى به",
      summaryAr:
        "يدمج البقوليات لتثبيت النيتروجين طبيعياً وكسر دورة الآفات مع استقرار عائد 3 مواسم.",
      colorTheme: "success",
    },
    cash: {
      titleAr: "المسار النقدي السريع",
      badgeAr: "عالي المخاطرة",
      summaryAr:
        "محاصيل نقدية متتالية ترفع ذروة الربح في السنوات المثالية لكنها تستنزف التربة وتنهار في موجات الحر.",
      colorTheme: "danger",
    },
    resilient: {
      titleAr: "مسار الصمود المناخي وتوفير المياه",
      badgeAr: "تحمل الحر والجفاف",
      summaryAr:
        "محاصيل جذور عميقة تتحمل العجز المائي وموجات الحر القصوى بأقل تقلب في الدخل.",
      colorTheme: "primary",
    },
  };

  const finalResults: Record<PathwayId, PathwaySimulationResult> = {} as never;

  for (const pid of pathwayOrder) {
    const raw = rawResults[pid];
    const sorted = [...raw.annualProfitsEgp].sort((a, b) => a - b);

    // PRD Section 5 exact formula: P10 = index 1, P50 = avg(index 4, 5), P90 = index 8
    const p10Egp = sorted[1];
    const p50Egp = Math.round((sorted[4] + sorted[5]) / 2);
    const p90Egp = sorted[8];

    const mean =
      sorted.reduce((sum, v) => sum + v, 0) / Math.max(1, sorted.length);
    const variance =
      sorted.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) /
      Math.max(1, sorted.length);
    const stdDev = Math.sqrt(variance);
    const cvPct = Number(((stdDev / Math.max(1, mean)) * 100).toFixed(1));

    // 1 sack of Urea (50kg, 46% N) = 23 kg pure Nitrogen
    const nitrogenDeltaVsCash = raw.netNitrogenKg - cashNitrogenKg;
    const ureaSacksSaved = Math.max(
      0,
      Number((nitrogenDeltaVsCash / 23).toFixed(1))
    );

    const waterSavedPct = Math.max(
      0,
      Math.round(((cashWaterM3 - raw.totalWaterM3) / Math.max(1, cashWaterM3)) * 100)
    );

    const baseSoilHealth =
      pid === "balanced" ? 86 : pid === "resilient" ? 78 : 42;
    const soilHealthScore = clamp(
      Math.round(
        baseSoilHealth -
          (raw.hasConflict ? 14 : 0) -
          heatStressC * 2.2 -
          waterDeficitPct * 0.15
      ),
      18,
      96
    );

    const radar: RadarScores = {
      cashReturn: clamp(Math.round((p50Egp / 135000) * 100), 20, 98),
      waterSaving: clamp(Math.round(32 + waterSavedPct * 1.45), 18, 98),
      nitrogenCharge: clamp(
        Math.round(52 + raw.netNitrogenKg * 0.45),
        12,
        98
      ),
      heatResilience: clamp(
        Math.round(raw.avgHeatTolerance * 23 - heatStressC * 4),
        15,
        98
      ),
      pestBreak: clamp(
        Math.round(raw.avgPestBreak - (raw.hasConflict ? 28 : 0)),
        15,
        98
      ),
    };

    const fieldGrid = buildFieldGrid(
      raw.seasons,
      prevCrop,
      raw.hasConflict,
      soilHealthScore,
      heatStressC,
      waterDeficitPct
    );

    finalResults[pid] = {
      id: pid,
      titleAr: metaByPathway[pid].titleAr,
      badgeAr: metaByPathway[pid].badgeAr,
      summaryAr: metaByPathway[pid].summaryAr,
      colorTheme: metaByPathway[pid].colorTheme,
      seasons: raw.seasons,
      hasFamilyConflict: raw.hasConflict,
      conflictDetailsAr: raw.conflictDetailsAr,
      p10Egp,
      p50Egp,
      p90Egp,
      cvPct,
      annualProfitsEgp: raw.annualProfitsEgp,
      ureaSacksSaved,
      waterSavedPct,
      totalWaterM3: raw.totalWaterM3,
      netNitrogenKg: raw.netNitrogenKg,
      soilHealthScore,
      radar,
      fieldGrid,
    };
  }

  return finalResults;
}

