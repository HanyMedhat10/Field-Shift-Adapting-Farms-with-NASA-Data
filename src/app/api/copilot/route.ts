import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface CopilotRequestBody {
  governorateNameAr?: string;
  governorateNameEn?: string;
  prevCropNameAr?: string;
  prevCropNameEn?: string;
  heatStressC?: number;
  waterDeficitPct?: number;
  selectedPathway?: {
    id: string;
    titleAr: string;
    titleEn?: string;
    seasonsNamesAr: string[];
    seasonsNamesEn?: string[];
    p10Egp: number;
    p50Egp: number;
    p90Egp: number;
    cvPct: number;
    ureaSacksSaved: number;
    waterSavedPct: number;
    hasFamilyConflict: boolean;
    conflictDetailsAr: string | null;
    conflictDetailsEn?: string | null;
  };
  cashPathway?: {
    p10Egp: number;
    p50Egp: number;
  };
  multiScale?: {
    meanT2mC: number;
    ndviValue: number;
    rootMoisturePct: number;
    polarization: string;
  };
}

function buildFallbackBilingualAdvice(body: CopilotRequestBody): {
  headlineAr: string;
  headlineEn: string;
  adviceAr: string;
  adviceEn: string;
  actionChecklistAr: string[];
  actionChecklistEn: string[];
} {
  const govAr = body.governorateNameAr ?? "الغربية";
  const govEn = body.governorateNameEn ?? "Gharbia";
  const prevAr = body.prevCropNameAr ?? "القمح";
  const prevEn = body.prevCropNameEn ?? "Wheat";
  const heat = body.heatStressC ?? 1.5;
  const water = body.waterDeficitPct ?? 15;
  const p = body.selectedPathway;
  const cash = body.cashPathway;
  const ms = body.multiScale;

  const seasonsTextAr =
    p?.seasonsNamesAr?.join(" ثم ") ?? "فول صويا ثم بنجر السكر ثم برسيم";
  const seasonsTextEn =
    p?.seasonsNamesEn?.join(" → ") ?? "Soybean → Sugar Beet → Alfalfa / Berseem";
  const p10 = (p?.p10Egp ?? 84000).toLocaleString("en-US");
  const p50 = (p?.p50Egp ?? 102000).toLocaleString("en-US");
  const p90 = (p?.p90Egp ?? 118000).toLocaleString("en-US");
  const urea = p?.ureaSacksSaved ?? 4.2;
  const waterSaved = p?.waterSavedPct ?? 24;
  const ndvi = ms?.ndviValue ?? 0.68;
  const rootPct = ms?.rootMoisturePct ?? 52;
  const pol = ms?.polarization ?? "VV+VH";

  if (p?.id === "cash") {
    return {
      headlineAr: `خلي بالك يا هندسة في أرض ${govAr}: المسار النقدي فيه مخاطرة عالية!`,
      headlineEn: `High Risk Alert in ${govEn}: Cash-First Pathway Exposes Your Soil!`,
      adviceAr: `أرقام أقمار ناسا بتقول إن رطوبة الجذور (SMAP) دلوقتي ${rootPct}% ومؤشر الخضرة ${ndvi}. لو كررت محاصيل نفس العائلة النباتية بعد ${prevAr} مع موجة حر +${heat}°C وعجز مية -${water}%، التربة هتنضرب بالآفات وهتخسر في أسوأ سنة (P10) وتنزل لـ ${p10} جنيه/فدان، ده غير إنك هتصرف شكاير يوريا أكتر بكتير. الأفضل تحوّل للمسار المتوازن أو مسار الصمود.`,
      adviceEn: `NASA satellite telemetry shows root-zone moisture (SMAP) at ${rootPct}% and vegetation index (NDVI) at ${ndvi}. Repeating the same botanical family after ${prevEn} under a +${heat}°C heat wave and -${water}% water deficit triggers severe pest pressure, dropping your worst-year income (P10) to ${p10} EGP/feddan while consuming far more urea fertilizer. Switching to the Balanced or Climate-Resilient pathway is strongly advised.`,
      actionChecklistAr: [
        `ابعد عن تكرار نفس العائلة النباتية بعد ${prevAr} عشان تكسر دورة النيماتودا والأعفان.`,
        `قلّل الاعتماد على التسميد الكيماوي وأدخل محصول بقولي في العروة الجاية.`,
        `راقب رطوبة السطح بالرادار (${pol}) قبل الري لتفادي غسيل السماد.`,
      ],
      actionChecklistEn: [
        `Avoid repeating the same botanical family after ${prevEn} to break nematode and root-rot cycles.`,
        `Cut synthetic fertilizer reliance by introducing a nitrogen-fixing legume next season.`,
        `Monitor topsoil moisture via SAR radar (${pol}) before irrigating to prevent nutrient leaching.`,
      ],
    };
  }

  if (p?.id === "resilient") {
    return {
      headlineAr: `خطة طوارئ مناخية مضمونة لأرض ${govAr} ضد الحر والعطش`,
      headlineEn: `Climate Shield Plan for ${govEn}: Built for Heat & Water Scarcity`,
      adviceAr: `بناءً على بيانات 10 سنين من NASA POWER ورصد رطوبة الجذور (${rootPct}%)، مسار الصمود (${seasonsTextAr}) هو أنسب درع لأرضك بعد ${prevAr} قصاد موجة الحر +${heat}°C وعجز الري -${water}%. الجذور العميقة هنا هتحافظ لك على دخل مضمون في أسوأ موسم (P10) يوصل لـ ${p10} جنيه/فدان، مع متوسط متوقع ${p50} جنيه، وكمان هتوفر ${waterSaved}% من مية الري و${urea} شكارة يوريا.`,
      adviceEn: `Based on 10 years of NASA POWER climate records and SMAP root moisture (${rootPct}%), the Climate-Resilient sequence (${seasonsTextEn}) is your strongest shield after ${prevEn} against +${heat}°C heat stress and -${water}% irrigation deficit. Deep root systems protect your worst-year income (P10) at ${p10} EGP/feddan with a ${p50} EGP median, while saving ${waterSaved}% irrigation water and ${urea} urea sacks.`,
      actionChecklistAr: [
        `ابدأ بـ ${p?.seasonsNamesAr?.[0] ?? "الفول"} لتثبيت الأزوت وتخفيف حرارة التربة.`,
        `استفيد من الجذور العميقة لتقليل عدد الريات بنسبة ${waterSaved}% في ذروة الصيف.`,
        `لو الحرارة زادت عن +${heat}°C، حافظ على الري الليلي حسب قراءات SMAP.`,
      ],
      actionChecklistEn: [
        `Start with ${p?.seasonsNamesEn?.[0] ?? "Fava Bean"} to fix nitrogen naturally and shade topsoil.`,
        `Leverage deep-rooting crops to reduce summer irrigation cycles by ${waterSaved}%.`,
        `If heat exceeds +${heat}°C, shift to night irrigation guided by SMAP root-zone readings.`,
      ],
    };
  }

  const cashP10Diff =
    p && cash ? Math.max(0, p.p10Egp - cash.p10Egp).toLocaleString("en-US") : "14,500";

  return {
    headlineAr: `التوصية الذهبية لأرض ${govAr}: ازرع (${seasonsTextAr}) بعد ${prevAr}`,
    headlineEn: `Optimal Rotation for ${govEn}: Plant (${seasonsTextEn}) after ${prevEn}`,
    adviceAr: `يا ريس، قرايات ناسا لأرضك في ${govAr} (غطاء نباتي ${ndvi} ورطوبة جذور ${rootPct}%) بتقول إن المسار المتوازن بعد ${prevAr} هو أذكى قرار في ظل حر +${heat}°C وعجز مية -${water}%. البقوليات هتشحن لك التربة نيتروجين وتوفرلك حوالي ${urea} شكارة يوريا، وهتوفر ${waterSaved}% من المية. والأهم إن دخلك في أسوأ سنة مناخية (P10) هيبقى ${p10} جنيه/فدان — يعني أحسن من المسار النقدي بحوالي ${cashP10Diff} جنيه ومتوسط ${p50} جنيه (وأعلى سقف P90 يوصل ${p90} جنيه).`,
    adviceEn: `NASA readings for your plot in ${govEn} (NDVI ${ndvi}, root moisture ${rootPct}%) confirm that the Smart Balanced Rotation after ${prevEn} is your best choice under +${heat}°C heat stress and -${water}% water deficit. Legumes recharge soil nitrogen, saving roughly ${urea} sacks of 46% urea and ${waterSaved}% irrigation water. Most importantly, your worst-year income (P10) reaches ${p10} EGP/feddan — outperforming the Cash-First track by ${cashP10Diff} EGP with a ${p50} EGP median (P90 upside up to ${p90} EGP).`,
    actionChecklistAr: [
      `كسرت دورة الآفات تماماً بتغيير العائلة النباتية بعد ${prevAr} في الـ 3 مواسم.`,
      `وفّرت ${urea} شكارة يوريا 46% بتثبيت النيتروجين الحيوي في منطقة الجذور.`,
      `ثبّتُّ مخاطر الدخل (معامل التذبذب ${p?.cvPct ?? 11.4}%) قصاد أي موجة حر مفاجئة.`,
    ],
    actionChecklistEn: [
      `Completely interrupted soil pest cycles by rotating botanical families after ${prevEn} across all 3 seasons.`,
      `Saved ${urea} sacks of 46% urea fertilizer through biological nitrogen fixation in the root zone.`,
      `Stabilized income volatility (CV ${p?.cvPct ?? 11.4}%) against sudden heat-wave shocks.`,
    ],
  };
}

export async function POST(request: NextRequest) {
  let body: CopilotRequestBody = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const fallback = buildFallbackBilingualAdvice(body);
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    return NextResponse.json({
      mode: "offline-agronomic-advisor",
      ...fallback,
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are an expert Egyptian agronomist analyzing NASA satellite telemetry (NASA POWER, MODIS NDVI, SMAP, ASF Sentinel-1) for the ElMazra3a EL sa3ida decision cockpit.
Write clear, practical farming advice in BOTH polite simplified Egyptian Arabic (ar) AND crisp English (en), strictly grounded in the exact numbers below without inventing data:
- Governorate: ${body.governorateNameAr ?? "الغربية"} / ${body.governorateNameEn ?? "Gharbia"}
- Previous Crop: ${body.prevCropNameAr ?? "قمح"} / ${body.prevCropNameEn ?? "Wheat"}
- Climate Stress Test: Heat +${body.heatStressC ?? 1.5}°C, Water Deficit -${body.waterDeficitPct ?? 15}%
- Selected Pathway: ${body.selectedPathway?.titleAr ?? "المسار المتوازن الذكي"} / ${body.selectedPathway?.titleEn ?? "Smart Balanced Rotation"} (${body.selectedPathway?.seasonsNamesAr?.join(" → ") ?? ""} | ${body.selectedPathway?.seasonsNamesEn?.join(" → ") ?? ""})
- Yield Range (P10 / P50 / P90): ${body.selectedPathway?.p10Egp ?? 80000} / ${body.selectedPathway?.p50Egp ?? 100000} / ${body.selectedPathway?.p90Egp ?? 115000} EGP/feddan (CV ${body.selectedPathway?.cvPct ?? 12}%)
- Savings: ${body.selectedPathway?.ureaSacksSaved ?? 4} urea sacks, ${body.selectedPathway?.waterSavedPct ?? 22}% water
- NASA Telemetry: 10-yr temp ${body.multiScale?.meanT2mC ?? 22}°C, NDVI ${body.multiScale?.ndviValue ?? 0.68}, SMAP root moisture ${body.multiScale?.rootMoisturePct ?? 50}%, SAR ${body.multiScale?.polarization ?? "VV+VH"}
- Botanical Conflict: ${body.selectedPathway?.hasFamilyConflict ? body.selectedPathway.conflictDetailsEn ?? body.selectedPathway.conflictDetailsAr : "None"}

Return ONLY raw JSON (no markdown) with this exact schema:
{
  "headlineAr": "short headline in Egyptian Arabic",
  "headlineEn": "short headline in clear English",
  "adviceAr": "3-4 sentences explaining the decision with numbers in Egyptian Arabic",
  "adviceEn": "3-4 sentences explaining the decision with numbers in English",
  "actionChecklistAr": ["step 1 ar", "step 2 ar", "step 3 ar"],
  "actionChecklistEn": ["step 1 en", "step 2 en", "step 3 en"]
}`;

    const result = await Promise.race([
      model.generateContent(prompt),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Gemini timeout")), 7000)
      ),
    ]);

    const rawText = result.response.text().trim();
    const cleaned = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    const parsed = JSON.parse(cleaned) as Partial<typeof fallback>;

    if (
      parsed.headlineAr &&
      parsed.adviceAr &&
      Array.isArray(parsed.actionChecklistAr)
    ) {
      return NextResponse.json({
        mode: "gemini-live",
        headlineAr: parsed.headlineAr,
        headlineEn: parsed.headlineEn ?? fallback.headlineEn,
        adviceAr: parsed.adviceAr,
        adviceEn: parsed.adviceEn ?? fallback.adviceEn,
        actionChecklistAr: parsed.actionChecklistAr.slice(0, 3),
        actionChecklistEn: Array.isArray(parsed.actionChecklistEn)
          ? parsed.actionChecklistEn.slice(0, 3)
          : fallback.actionChecklistEn,
      });
    }
  } catch {
    // Fall back gracefully to built-in bilingual agronomic advisor
  }

  return NextResponse.json({
    mode: "offline-agronomic-advisor",
    ...fallback,
  });
}
