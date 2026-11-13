import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface CopilotRequestBody {
  governorateNameAr?: string;
  prevCropNameAr?: string;
  heatStressC?: number;
  waterDeficitPct?: number;
  selectedPathway?: {
    id: string;
    titleAr: string;
    seasonsNamesAr: string[];
    p10Egp: number;
    p50Egp: number;
    p90Egp: number;
    cvPct: number;
    ureaSacksSaved: number;
    waterSavedPct: number;
    hasFamilyConflict: boolean;
    conflictDetailsAr: string | null;
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

function buildFallbackEgyptianAdvice(body: CopilotRequestBody): {
  headlineAr: string;
  adviceAr: string;
  actionChecklistAr: string[];
} {
  const gov = body.governorateNameAr ?? "الغربية";
  const prev = body.prevCropNameAr ?? "القمح";
  const heat = body.heatStressC ?? 1.5;
  const water = body.waterDeficitPct ?? 15;
  const p = body.selectedPathway;
  const cash = body.cashPathway;
  const ms = body.multiScale;

  const seasonsText = p?.seasonsNamesAr?.join(" ثم ") ?? "فول صويا ثم بنجر السكر ثم برسيم";
  const p10 = (p?.p10Egp ?? 84000).toLocaleString("en-US");
  const p50 = (p?.p50Egp ?? 102000).toLocaleString("en-US");
  const p90 = (p?.p90Egp ?? 118000).toLocaleString("en-US");
  const urea = p?.ureaSacksSaved ?? 4.2;
  const waterSaved = p?.waterSavedPct ?? 24;
  const ndvi = ms?.ndviValue ?? 0.68;
  const rootPct = ms?.rootMoisturePct ?? 52;

  if (p?.id === "cash") {
    return {
      headlineAr: `خلي بالك يا هندسة في أرض ${gov}: المسار النقدي فيه مخاطرة عالية!`,
      adviceAr: `أرقام أقمار ناسا بتقول إن رطوبة الجذور (SMAP) دلوقتي ${rootPct}% ومؤشر الخضرة ${ndvi}. لو كررت محاصيل نفس العائلة النباتية بعد ${prev} مع موجة حر +${heat}°C وعجز مية -${water}%، التربة هتنضرب بالآفات وهتخسر في أسوأ سنة (P10) وتنزل لـ ${p10} جنيه/فدان، ده غير إنك هتصرف شكاير يوريا أكتر بكتير. الأفضل تحوّل للمسار المتوازن أو مسار الصمود.`,
      actionChecklistAr: [
        `ابعد عن تكرار نفس العائلة النباتية بعد ${prev} عشان تكسر دورة النيماتودا والأعفان.`,
        `قلّل الاعتماد على التسميد الكيماوي وأدخل محصول بقولي في العروة الجاية.`,
        `راقب رطوبة السطح بالرادار (${ms?.polarization ?? "VV+VH"}) قبل الري لتفادي غسيل السماد.`,
      ],
    };
  }

  if (p?.id === "resilient") {
    return {
      headlineAr: `خطة طوارئ مناخية مضمونة لأرض ${gov} ضد الحر والعطش`,
      adviceAr: `بناءً على بيانات 10 سنين من NASA POWER ورصد رطوبة الجذور (${rootPct}%)، مسار الصمود (${seasonsText}) هو أنسب درع لأرضك بعد ${prev} قصاد موجة الحر +${heat}°C وعجز الري -${water}%. الجذور العميقة هنا هتحافظ لك على دخل مضمون في أسوأ موسم (P10) يوصل لـ ${p10} جنيه/فدان، مع متوسط متوقع ${p50} جنيه، وكمان هتوفر ${waterSaved}% من مية الري و${urea} شكارة يوريا.`,
      actionChecklistAr: [
        `ابدأ بـ ${p?.seasonsNamesAr?.[0] ?? "الفول"} لتثبيت الأزوت وتخفيف حرارة التربة.`,
        `استفيد من الجذور العميقة لتقليل عدد الريات بنسبة ${waterSaved}% في ذروة الصيف.`,
        `لو الحرارة زادت عن +${heat}°C، حافظ على الري الليلي حسب قراءات SMAP.`,
      ],
    };
  }

  const cashP10Diff =
    p && cash ? Math.max(0, p.p10Egp - cash.p10Egp).toLocaleString("en-US") : "14,500";

  return {
    headlineAr: `التوصية الذهبية لأرض ${gov}: ازرع (${seasonsText}) بعد ${prev}`,
    adviceAr: `يا ريس، قرايات ناسا لأرضك في ${gov} (غطاء نباتي ${ndvi} ورطوبة جذور ${rootPct}%) بتقول إن المسار المتوازن بعد ${prev} هو أذكى قرار في ظل حر +${heat}°C وعجز مية -${water}%. البقوليات هتشحن لك التربة نيتروجين وتوفرلك حوالي ${urea} شكارة يوريا، وهتوفر ${waterSaved}% من المية. والأهم إن دخلك في أسوأ سنة مناخية (P10) هيبقى ${p10} جنيه/فدان — يعني أحسن من المسار النقدي بحوالي ${cashP10Diff} جنيه ومتوسط ${p50} جنيه (وأعلى سقف P90 يوصل ${p90} جنيه).`,
    actionChecklistAr: [
      `كسرت دورة الآفات تماماً بتغيير العائلة النباتية بعد ${prev} في الـ 3 مواسم.`,
      `وفّرت ${urea} شكارة يوريا 46% بتثبيت النيتروجين الحيوي في منطقة الجذور.`,
      `ثبّتُّ مخاطر الدخل (معامل التذبذب ${p?.cvPct ?? 11.4}%) قصاد أي موجة حر مفاجئة.`,
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

  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    return NextResponse.json({
      mode: "offline-agronomic-advisor",
      ...buildFallbackEgyptianAdvice(body),
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `أنت مستشار زراعي مصري خبير في تحليل بيانات أقمار ناسا الصناعية (NASA POWER, MODIS NDVI, SMAP, ASF Sentinel-1) لمشروع ElMazra3a EL sa3ida.
اكتب نصيحة عملية وواضحة للمزارع المصري بالعامية المصرية المهذبة والمبسطة، وبناءً على الأرقام التالية فقط دون اختراع أرقام:
- المحافظة: ${body.governorateNameAr ?? "الغربية"}
- المحصول السابق: ${body.prevCropNameAr ?? "قمح"}
- محاكاة الصدمة: موجة حر +${body.heatStressC ?? 1.5}°C وعجز مياه -${body.waterDeficitPct ?? 15}%
- المسار المختار: ${body.selectedPathway?.titleAr ?? "المسار المتوازن الذكي"} (${body.selectedPathway?.seasonsNamesAr?.join(" ← ") ?? ""})
- نطاق العائد (P10 / P50 / P90): ${body.selectedPathway?.p10Egp ?? 80000} / ${body.selectedPathway?.p50Egp ?? 100000} / ${body.selectedPathway?.p90Egp ?? 115000} جنيه/فدان (معامل التذبذب ${body.selectedPathway?.cvPct ?? 12}%)
- التوفير: ${body.selectedPathway?.ureaSacksSaved ?? 4} شكارة يوريا و ${body.selectedPathway?.waterSavedPct ?? 22}% مياه ري
- قراءات ناسا: حرارة 10 سنوات ${body.multiScale?.meanT2mC ?? 22}°C، NDVI ${body.multiScale?.ndviValue ?? 0.68}، رطوبة الجذور SMAP ${body.multiScale?.rootMoisturePct ?? 50}%، رادار ${body.multiScale?.polarization ?? "VV+VH"}
- تعارض العائلة النباتية: ${body.selectedPathway?.hasFamilyConflict ? body.selectedPathway.conflictDetailsAr : "لا يوجد تعارض"}

أعد الرد بصيغة JSON فقط بدون markdown بهذا الشكل:
{
  "headlineAr": "عنوان قصير جذاب بالعامية المصرية",
  "adviceAr": "فقرة من 3 إلى 4 جمل تشرح القرار بالأرقام بالعامية المصرية",
  "actionChecklistAr": ["خطوة 1", "خطوة 2", "خطوة 3"]
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

    const parsed = JSON.parse(cleaned) as {
      headlineAr?: string;
      adviceAr?: string;
      actionChecklistAr?: string[];
    };

    if (parsed.headlineAr && parsed.adviceAr && Array.isArray(parsed.actionChecklistAr)) {
      return NextResponse.json({
        mode: "gemini-live",
        headlineAr: parsed.headlineAr,
        adviceAr: parsed.adviceAr,
        actionChecklistAr: parsed.actionChecklistAr.slice(0, 3),
      });
    }
  } catch {
    // Fall back gracefully to built-in Egyptian Arabic agronomic advisor
  }

  return NextResponse.json({
    mode: "offline-agronomic-advisor",
    ...buildFallbackEgyptianAdvice(body),
  });
}

