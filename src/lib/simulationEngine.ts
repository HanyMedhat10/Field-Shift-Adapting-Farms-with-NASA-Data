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
  labelEn: string;
  season1Crop: CropInfo;
  season2Crop: CropInfo;
  season3Crop: CropInfo;
  hasConflict: boolean;
  conflictReasonAr: string | null;
  conflictReasonEn: string | null;
  nitrogenBalanceKg: number;
  waterDemandM3: number;
  healthScore: number;
}

export interface PathwaySimulationResult {
  id: PathwayId;
  titleAr: string;
  titleEn: string;
  badgeAr: string;
  badgeEn: string;
  summaryAr: string;
  summaryEn: string;
  plainSummaryLinesAr: [string, string, string];
  plainSummaryLinesEn: [string, string, string];
  colorTheme: "success" | "danger" | "primary";
  seasons: [CropInfo, CropInfo, CropInfo];
  hasFamilyConflict: boolean;
  conflictDetailsAr: string | null;
  conflictDetailsEn: string | null;
  p10Egp: number;
  p50Egp: number;
  p90Egp: number;
  cvPct: number;
  annualProfitsEgp: number[];
  /** Net Urea 46% bags (total_n_impact / 23): positive = natural savings, negative = extra sacks bought */
  netUreaBags: number;
  /** Urea 46% sacks saved compared to the Cash pathway */
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
        resilient: ["soybean", "sugarbeet", "sunflower"],
      };
    case "maize":
      return {
        balanced: ["berseem", "soybean", "sugarbeet"],
        cash: ["wheat", "maize", "potato"],
        resilient: ["fava", "sunflower", "sugarbeet"],
      };
    case "wheat":
    default:
      return {
        balanced: ["soybean", "sugarbeet", "berseem"],
        cash: ["maize", "potato", "wheat"],
        resilient: ["fava", "sunflower", "sugarbeet"],
      };
  }
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

function detectFamilyConflict(
  prevCrop: CropInfo,
  seasons: [CropInfo, CropInfo, CropInfo]
): { hasConflict: boolean; detailsAr: string | null; detailsEn: string | null } {
  const sequence = [prevCrop, ...seasons];
  for (let i = 1; i < sequence.length; i++) {
    if (sequence[i].family === sequence[i - 1].family) {
      return {
        hasConflict: true,
        detailsAr: `تنبيه تعارض نباتي (-18%): زراعة ${sequence[i].nameAr} بعد ${sequence[i - 1].nameAr} تكرر العائلة ${sequence[i].familyAr} وترفع مخاطر الآفات والنيماتودا.`,
        detailsEn: `Botanical Clash Warning (-18%): Planting ${sequence[i].nameEn} after ${sequence[i - 1].nameEn} repeats the ${sequence[i].family} family and raises pest & nematode risk.`,
      };
    }
  }
  const families = new Set(seasons.map((c) => c.family));
  if (families.size < 3 && seasons.some((c) => c.family === prevCrop.family)) {
    return {
      hasConflict: true,
      detailsAr: `تنبيه (-18%): تكرار العائلة ${prevCrop.familyAr} خلال 3 مواسم يضعف التربة ويزيد الآفات.`,
      detailsEn: `Warning (-18%): Repeating ${prevCrop.family} within 3 seasons depletes soil health and elevates pest buildup.`,
    };
  }
  return { hasConflict: false, detailsAr: null, detailsEn: null };
}

function buildFieldGrid(
  seasons: [CropInfo, CropInfo, CropInfo],
  prevCrop: CropInfo,
  hasConflict: boolean,
  soilHealthScore: number,
  heatStressC: number,
  waterDeficitPct: number
): FieldPlotCell[] {
  const sectorLabels: { ar: string; en: string }[] = [
    { ar: "حوض ١ - شمال شرق", en: "Plot 1 - Northeast" },
    { ar: "حوض ٢ - شمال وسط", en: "Plot 2 - North Center" },
    { ar: "حوض ٣ - شمال غرب", en: "Plot 3 - Northwest" },
    { ar: "حوض ٤ - قلب الفدان", en: "Plot 4 - Feddan Core" },
    { ar: "حوض ٥ - المروى الرئيسي", en: "Plot 5 - Main Canal" },
    { ar: "حوض ٦ - وسط غرب", en: "Plot 6 - Mid West" },
    { ar: "حوض ٧ - جنوب شرق", en: "Plot 7 - Southeast" },
    { ar: "حوض ٨ - جنوب وسط", en: "Plot 8 - South Center" },
    { ar: "حوض ٩ - مصرف الحقل", en: "Plot 9 - Field Drain" },
  ];

  return sectorLabels.map((label, idx) => {
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
      hasConflict &&
      (seasons[0].family === prevCrop.family || seasons[1].family === seasons[0].family);

    return {
      index: idx + 1,
      labelAr: label.ar,
      labelEn: label.en,
      season1Crop: seasons[0],
      season2Crop: seasons[1],
      season3Crop: seasons[2],
      hasConflict: plotConflict,
      conflictReasonAr: plotConflict
        ? `تراكم آفات العائلة ${seasons[0].familyAr} (-18%)`
        : null,
      conflictReasonEn: plotConflict
        ? `${seasons[0].family} pest buildup (-18%)`
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

  const rawResults: Record<
    PathwayId,
    {
      seasons: [CropInfo, CropInfo, CropInfo];
      annualProfitsEgp: number[];
      totalWaterM3: number;
      netNitrogenKg: number;
      hasConflict: boolean;
      conflictDetailsAr: string | null;
      conflictDetailsEn: string | null;
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

    const annualProfitsEgp = annualRecords.map((yearRec) => {
      let seasonSum = 0;

      for (let sIdx = 0; sIdx < seasons.length; sIdx++) {
        const crop = seasons[sIdx];
        const effectiveHeatC = Math.max(0, yearRec.tempAnomalyC + heatStressC);
        const heatExcess = Math.max(0, effectiveHeatC - crop.heatToleranceC);
        const heatPenalty = Math.min(0.46, heatExcess * 0.145);

        const effectiveWaterDeficit =
          waterDeficitPct + (1 - yearRec.moistureIndex) * 14;
        const droughtExcess = Math.max(
          0,
          effectiveWaterDeficit - crop.droughtTolerancePct
        );
        const droughtPenalty = Math.min(0.48, droughtExcess * 0.013);

        // Urea 46% fertilizer saving/cost (~950 EGP per 50kg bag = 23kg N)
        const nAdjustmentEgp =
          crop.nitrogenKgPerFeddan > 0
            ? crop.nitrogenKgPerFeddan * 42
            : crop.nitrogenKgPerFeddan * 38;

        // Exact 18% botanical family clash penalty (pest/nematode penalty)
        const sequenceConflictPenalty = conflict.hasConflict ? 0.18 : 0;

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
      conflictDetailsEn: conflict.detailsEn,
      avgPestBreak,
      avgHeatTolerance,
    };
  }

  const cashWaterM3 = rawResults.cash.totalWaterM3;
  const cashNitrogenKg = rawResults.cash.netNitrogenKg;

  const metaByPathway: Record<
    PathwayId,
    {
      titleAr: string;
      titleEn: string;
      badgeAr: string;
      badgeEn: string;
      summaryAr: string;
      summaryEn: string;
      colorTheme: "success" | "danger" | "primary";
    }
  > = {
    balanced: {
      titleAr: "المسار المتوازن الذكي",
      titleEn: "Smart Balanced Rotation",
      badgeAr: "موصى به",
      badgeEn: "Recommended",
      summaryAr:
        "يدخل البقوليات لتثبيت النيتروجين طبيعياً، يكسر دورة الآفات، ويوفر شكاير سماد اليوريا.",
      summaryEn:
        "Integrates legumes to fix nitrogen naturally, breaks soil pest cycles, and cuts urea fertilizer sacks.",
      colorTheme: "success",
    },
    cash: {
      titleAr: "المسار النقدي السريع",
      titleEn: "Cash-First Intensive",
      badgeAr: "عالي المخاطرة",
      badgeEn: "High Risk",
      summaryAr:
        "محاصيل نقدية سريعة العائد لكنها تكشف استنزاف التربة وخصم 18% عند تكرار العائلة النباتية.",
      summaryEn:
        "High short-term cash crops that expose soil depletion and trigger an 18% pest penalty on family clashes.",
      colorTheme: "danger",
    },
    resilient: {
      titleAr: "مسار الصمود المناخي وتوفير المياه",
      titleEn: "Climate & Water Resilient",
      badgeAr: "تحمل الحر والجفاف",
      badgeEn: "Heat & Drought Shield",
      summaryAr:
        "محاصيل جذور عميقة تتحمل العطش وموجات الحر بأقل خسارة في سنوات الجفاف.",
      summaryEn:
        "Deep-rooted, drought- and heat-tolerant crops engineered to minimize yield drops in arid years.",
      colorTheme: "primary",
    },
  };

  const finalResults: Record<PathwayId, PathwaySimulationResult> = {} as never;

  for (const pid of pathwayOrder) {
    const raw = rawResults[pid];
    const sorted = [...raw.annualProfitsEgp].sort((a, b) => a - b);

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

    // Net Urea 46% bags = total_n_impact / 23
    const netUreaBags = Number((raw.netNitrogenKg / 23).toFixed(1));
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

    const p10Txt = p10Egp.toLocaleString("en-US");
    const p50Txt = p50Egp.toLocaleString("en-US");
    const plainSummaryLinesAr: [string, string, string] =
      pid === "cash"
        ? [
            `في أسوأ سنة مناخية ينزل دخلك إلى ${p10Txt} ج/فدان (مقابل متوسط ${p50Txt} ج) بسبب حساسية المحاصيل للحر والعطش.`,
            `هذا المسار يستهلك ${Math.abs(netUreaBags)} شكارة سماد يوريا 46% إضافية ويسحب كمية أكبر من مياه الري.`,
            raw.hasConflict
              ? `يقع في تكرار العائلة النباتية بعد ${prevCrop.nameAr} مما يخصم 18% من الإنتاج بسبب الآفات والنيماتودا.`
              : `لا يعوّض خصوبة التربة طبيعياً بعد ${prevCrop.nameAr} ويزيد تكلفة التسميد في المواسم القادمة.`,
          ]
        : pid === "resilient"
        ? [
            `يحمي جيبك في أسوأ سنة مناخية بحد أدنى ${p10Txt} ج/فدان وبمتوسط ${p50Txt} ج حتى مع زيادة الحرارة (+${heatStressC}°C).`,
            `يوفر ${waterSavedPct}% من مياه الري ويوفر ${ureaSacksSaved} شكارة سماد يوريا مقارنة بالمسار النقدي بفضل الجذور العميقة.`,
            `ينوّع العائلات النباتية بعد ${prevCrop.nameAr} تماماً ليمنع خصم الآفات (-18%) ويحافظ على رطوبة التربة.`,
          ]
        : [
            `يحافظ على دخل متوازن يصل في أسوأ سنة إلى ${p10Txt} ج/فدان وبمتوسط متوقع ${p50Txt} ج عبر 3 مواسم متكاملة.`,
            `يزرع البقوليات لتثبيت النيتروجين مما يوفر لك ${ureaSacksSaved} شكارة سماد يوريا 46% ويخفض مياه الري بنسبة ${waterSavedPct}%.`,
            `يكسر دورة الآفات بعد ${prevCrop.nameAr} بدون أي تكرار للعائلة النباتية، فيحمي أرضك من خصم الـ 18% ومن إجهاد السماد.`,
          ];

    const plainSummaryLinesEn: [string, string, string] =
      pid === "cash"
        ? [
            `In the worst climate year, income drops to ${p10Txt} EGP/feddan (vs. ${p50Txt} EGP median) due to heat and drought sensitivity.`,
            `This sequence consumes ${Math.abs(netUreaBags)} extra 46% urea sacks and demands heavy irrigation volumes.`,
            raw.hasConflict
              ? `Repeats the same botanical family after ${prevCrop.nameEn}, triggering an 18% pest and nematode penalty.`
              : `Fails to replenish soil fertility after ${prevCrop.nameEn}, raising fertilizer costs in upcoming seasons.`,
          ]
        : pid === "resilient"
        ? [
            `Protects your downside in the worst climate year at ${p10Txt} EGP/feddan (${p50Txt} EGP median) even under +${heatStressC}°C heat.`,
            `Saves ${waterSavedPct}% irrigation water and ${ureaSacksSaved} urea sacks compared to the Cash track via deep roots.`,
            `Diversifies botanical families after ${prevCrop.nameEn}, eliminating the -18% pest penalty while preserving root moisture.`,
          ]
        : [
            `Delivers balanced stability with ${p10Txt} EGP/feddan worst-year floor and ${p50Txt} EGP expected median across 3 seasons.`,
            `Integrates legumes to fix nitrogen, saving ${ureaSacksSaved} sacks of 46% urea and reducing irrigation demand by ${waterSavedPct}%.`,
            `Breaks pest cycles after ${prevCrop.nameEn} with zero family overlap, avoiding the 18% yield penalty and fertilizer strain.`,
          ];

    finalResults[pid] = {
      id: pid,
      titleAr: metaByPathway[pid].titleAr,
      titleEn: metaByPathway[pid].titleEn,
      badgeAr: metaByPathway[pid].badgeAr,
      badgeEn: metaByPathway[pid].badgeEn,
      summaryAr: metaByPathway[pid].summaryAr,
      summaryEn: metaByPathway[pid].summaryEn,
      plainSummaryLinesAr,
      plainSummaryLinesEn,
      colorTheme: metaByPathway[pid].colorTheme,
      seasons: raw.seasons,
      hasFamilyConflict: raw.hasConflict,
      conflictDetailsAr: raw.conflictDetailsAr,
      conflictDetailsEn: raw.conflictDetailsEn,
      p10Egp,
      p50Egp,
      p90Egp,
      cvPct,
      annualProfitsEgp: raw.annualProfitsEgp,
      netUreaBags,
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
