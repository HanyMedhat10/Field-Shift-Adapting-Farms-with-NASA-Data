"use client";

import { useLanguage, useTheme } from "@/app/providers";
import { Button, Chip, Select, SelectItem, Slider } from "@heroui/react";
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  ScatterController,
  Tooltip,
} from "chart.js";
import { CountryCode } from "@/lib/currency";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Database,
  Flame,
  Gamepad2,
  Globe,
  Layers,
  Moon,
  Satellite,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Table2,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Line, Scatter } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  ScatterController,
  Tooltip,
  Legend
);

interface RegionAnalyticsItem {
  id: string;
  country: CountryCode;
  nameAr: string;
  nameEn: string;
  color: string;
  lat: number;
  elevationM: number;
  /** Monthly temperatures (Feb to Dec = 11 months, matching the NASA POWER 2024 dataset) */
  monthlyTempC: number[];
  /** Monthly root-zone soil wetness GWETROOT (Feb to Dec = 11 months) */
  monthlyGwet: number[];
  annualMeanTempC: number;
  ndvi: number;
  meanRootMoisture: number;
}

const MONTHS_AR = [
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

const MONTHS_EN = [
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const REGIONS_DATA: RegionAnalyticsItem[] = [
  {
    id: "gharbia",
    country: "EG",
    nameAr: "الغربية (الدلتا)",
    nameEn: "Gharbia (Delta)",
    color: "#10b981",
    lat: 30.8754,
    elevationM: 4.96,
    monthlyTempC: [
      14.82, 17.97, 22.52, 25.4, 30.72, 31.6, 30.69, 28.83, 24.46, 19.98, 15.77,
    ],
    monthlyGwet: [
      0.47, 0.46, 0.46, 0.46, 0.45, 0.45, 0.45, 0.45, 0.45, 0.45, 0.46,
    ],
    annualMeanTempC: 23.11,
    ndvi: 0.73,
    meanRootMoisture: 0.46,
  },
  {
    id: "dakahlia",
    country: "EG",
    nameAr: "الدقهلية",
    nameEn: "Dakahlia",
    color: "#f59e0b",
    lat: 31.0409,
    elevationM: 4.96,
    monthlyTempC: [
      14.82, 17.97, 22.52, 25.4, 30.72, 31.6, 30.69, 28.83, 24.46, 19.98, 15.77,
    ],
    monthlyGwet: [
      0.47, 0.46, 0.46, 0.46, 0.45, 0.45, 0.45, 0.45, 0.45, 0.45, 0.46,
    ],
    annualMeanTempC: 23.11,
    ndvi: 0.7,
    meanRootMoisture: 0.44,
  },
  {
    id: "beheira",
    country: "EG",
    nameAr: "البحيرة",
    nameEn: "Beheira",
    color: "#06b6d4",
    lat: 30.8481,
    elevationM: 11.2,
    monthlyTempC: [
      14.6, 17.85, 22.4, 25.55, 30.85, 31.75, 30.9, 28.9, 24.5, 19.8, 15.6,
    ],
    monthlyGwet: [
      0.49, 0.48, 0.47, 0.46, 0.44, 0.43, 0.43, 0.44, 0.45, 0.46, 0.47,
    ],
    annualMeanTempC: 23.06,
    ndvi: 0.66,
    meanRootMoisture: 0.46,
  },
  {
    id: "minya",
    country: "EG",
    nameAr: "المنيا",
    nameEn: "Minya",
    color: "#f43f5e",
    lat: 28.1099,
    elevationM: 114.52,
    monthlyTempC: [
      13.75, 18.4, 24.24, 27.72, 32.54, 32.99, 32.63, 30.11, 24.31, 18.31, 13.77,
    ],
    monthlyGwet: [
      0.35, 0.35, 0.35, 0.35, 0.34, 0.34, 0.34, 0.34, 0.34, 0.34, 0.35,
    ],
    annualMeanTempC: 23.5,
    ndvi: 0.64,
    meanRootMoisture: 0.36,
  },
  {
    id: "fayoum",
    country: "EG",
    nameAr: "الفيوم",
    nameEn: "Fayoum",
    color: "#a855f7",
    lat: 29.3084,
    elevationM: 84.28,
    monthlyTempC: [
      13.48, 17.12, 22.57, 26.25, 31.43, 32.04, 31.23, 29.1, 24.1, 18.75, 14.26,
    ],
    monthlyGwet: [
      0.45, 0.41, 0.37, 0.35, 0.34, 0.34, 0.34, 0.34, 0.34, 0.34, 0.34,
    ],
    annualMeanTempC: 22.82,
    ndvi: 0.63,
    meanRootMoisture: 0.38,
  },
  {
    id: "new_valley",
    country: "EG",
    nameAr: "الوادي الجديد",
    nameEn: "New Valley",
    color: "#3b82f6",
    lat: 25.4514,
    elevationM: 192.03,
    monthlyTempC: [
      14.0, 19.71, 25.19, 28.76, 32.98, 33.58, 34.22, 30.94, 24.45, 18.02, 13.67,
    ],
    monthlyGwet: [
      0.22, 0.22, 0.22, 0.22, 0.22, 0.22, 0.22, 0.22, 0.22, 0.22, 0.22,
    ],
    annualMeanTempC: 24.08,
    ndvi: 0.37,
    meanRootMoisture: 0.21,
  },
  {
    id: "us_california",
    country: "US",
    nameAr: "وادي كاليفورنيا الأوسط",
    nameEn: "California Central Valley",
    color: "#10b981",
    lat: 36.7378,
    elevationM: 94.0,
    monthlyTempC: [
      11.2, 14.1, 17.3, 21.8, 26.9, 30.4, 29.5, 25.8, 19.7, 13.6, 9.8,
    ],
    monthlyGwet: [
      0.56, 0.54, 0.5, 0.46, 0.42, 0.39, 0.38, 0.4, 0.44, 0.49, 0.54,
    ],
    annualMeanTempC: 18.2,
    ndvi: 0.68,
    meanRootMoisture: 0.47,
  },
  {
    id: "us_iowa",
    country: "US",
    nameAr: "حزام الذرة (أيوا)",
    nameEn: "Iowa Corn Belt",
    color: "#f59e0b",
    lat: 41.878,
    elevationM: 285.0,
    monthlyTempC: [
      -3.8, 3.4, 10.6, 16.8, 22.1, 24.3, 23.1, 18.4, 11.2, 3.5, -2.9,
    ],
    monthlyGwet: [
      0.68, 0.71, 0.73, 0.7, 0.66, 0.62, 0.6, 0.61, 0.64, 0.66, 0.67,
    ],
    annualMeanTempC: 10.4,
    ndvi: 0.79,
    meanRootMoisture: 0.66,
  },
  {
    id: "us_kansas",
    country: "US",
    nameAr: "حزام القمح (كانساس)",
    nameEn: "Kansas Wheat Belt",
    color: "#38bdf8",
    lat: 38.5266,
    elevationM: 560.0,
    monthlyTempC: [
      1.8, 7.6, 13.4, 18.9, 24.8, 27.9, 26.8, 21.9, 14.5, 7.1, 1.4,
    ],
    monthlyGwet: [
      0.46, 0.48, 0.49, 0.47, 0.42, 0.38, 0.37, 0.38, 0.41, 0.43, 0.45,
    ],
    annualMeanTempC: 13.6,
    ndvi: 0.58,
    meanRootMoisture: 0.43,
  },
];

interface CropSuitabilityRule {
  id: string;
  nameAr: string;
  nameEn: string;
  /** Month numbers (2..12) active in the season */
  months: number[];
  /** Trapezoidal thermal response [absMin, optLow, optHigh, absMax] in °C */
  tempThresholds: [number, number, number, number];
  /** Ideal root-zone wetness fraction (0..1) */
  waterNeedGwet: number;
}

const CROP_RULES: CropSuitabilityRule[] = [
  {
    id: "wheat",
    nameAr: "قمح",
    nameEn: "Wheat",
    months: [11, 12, 2, 3, 4],
    tempThresholds: [5, 12, 22, 30],
    waterNeedGwet: 0.35,
  },
  {
    id: "fava",
    nameAr: "فول بلدي",
    nameEn: "Fava Bean",
    months: [11, 12, 2, 3, 4],
    tempThresholds: [5, 12, 22, 28],
    waterNeedGwet: 0.35,
  },
  {
    id: "berseem",
    nameAr: "برسيم حجازي",
    nameEn: "Alfalfa / Berseem",
    months: [11, 12, 2, 3, 4, 5],
    tempThresholds: [5, 12, 24, 32],
    waterNeedGwet: 0.45,
  },
  {
    id: "sugarbeet",
    nameAr: "بنجر سكر",
    nameEn: "Sugar Beet",
    months: [10, 11, 12, 2, 3, 4],
    tempThresholds: [5, 15, 25, 32],
    waterNeedGwet: 0.35,
  },
  {
    id: "potato",
    nameAr: "بطاطس",
    nameEn: "Potato",
    months: [10, 11, 12, 2],
    tempThresholds: [7, 15, 22, 30],
    waterNeedGwet: 0.4,
  },
  {
    id: "maize",
    nameAr: "ذرة شامية",
    nameEn: "Maize",
    months: [5, 6, 7, 8],
    tempThresholds: [15, 22, 30, 36],
    waterNeedGwet: 0.4,
  },
  {
    id: "soybean",
    nameAr: "فول صويا",
    nameEn: "Soybean",
    months: [5, 6, 7, 8],
    tempThresholds: [14, 20, 30, 36],
    waterNeedGwet: 0.38,
  },
  {
    id: "rice",
    nameAr: "أرز",
    nameEn: "Rice",
    months: [5, 6, 7, 8, 9],
    tempThresholds: [18, 25, 32, 38],
    waterNeedGwet: 0.5,
  },
  {
    id: "cotton",
    nameAr: "قطن",
    nameEn: "Cotton",
    months: [4, 5, 6, 7, 8, 9],
    tempThresholds: [16, 24, 32, 38],
    waterNeedGwet: 0.35,
  },
  {
    id: "sunflower",
    nameAr: "عباد شمس",
    nameEn: "Sunflower",
    months: [4, 5, 6, 7],
    tempThresholds: [10, 20, 28, 35],
    waterNeedGwet: 0.25,
  },
  {
    id: "sorghum",
    nameAr: "ذرة رفيعة",
    nameEn: "Sorghum",
    months: [5, 6, 7, 8, 9],
    tempThresholds: [16, 25, 32, 40],
    waterNeedGwet: 0.22,
  },
];

function avg(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / Math.max(1, arr.length);
}

function trapezoidalTempScore(
  tempC: number,
  [absMin, optLow, optHigh, absMax]: [number, number, number, number]
): number {
  if (tempC >= optLow && tempC <= optHigh) return 1;
  if (tempC < optLow) {
    return Math.max(0, (tempC - absMin) / Math.max(0.1, optLow - absMin));
  }
  return Math.max(0, (absMax - tempC) / Math.max(0.1, absMax - optHigh));
}

function computeCropSuitability(
  region: RegionAnalyticsItem,
  crop: CropSuitabilityRule,
  heatShiftC: number,
  tempWeightFraction: number
): number {
  const tempScore =
    avg(
      crop.months.map((m) =>
        trapezoidalTempScore(
          region.monthlyTempC[m - 2] + heatShiftC,
          crop.tempThresholds
        )
      )
    ) * 100;
  const meanGwet = avg(crop.months.map((m) => region.monthlyGwet[m - 2]));
  const waterScore = Math.max(
    0,
    100 - Math.max(0, crop.waterNeedGwet - meanGwet) * 400
  );
  return Math.round(
    tempWeightFraction * tempScore + (1 - tempWeightFraction) * waterScore
  );
}

function pearsonCorrelation(x: number[], y: number[]): number {
  const mx = avg(x);
  const my = avg(y);
  let num = 0;
  let dx2 = 0;
  let dy2 = 0;
  for (let i = 0; i < x.length; i++) {
    const dx = x[i] - mx;
    const dy = y[i] - my;
    num += dx * dy;
    dx2 += dx * dx;
    dy2 += dy * dy;
  }
  const denom = Math.sqrt(dx2 * dy2);
  if (denom < 1e-9) return 0;
  return num / denom;
}

type FactorKey =
  | "lat"
  | "elev"
  | "meanTemp"
  | "summerPeak"
  | "thermalRange"
  | "rootMoisture"
  | "ndvi";

const FACTOR_META: {
  key: FactorKey;
  labelAr: string;
  labelEn: string;
  extract: (r: RegionAnalyticsItem) => number;
}[] = [
  {
    key: "lat",
    labelAr: "خط العرض (°N)",
    labelEn: "Latitude (°N)",
    extract: (r) => r.lat,
  },
  {
    key: "elev",
    labelAr: "الارتفاع (م)",
    labelEn: "Elevation (m)",
    extract: (r) => r.elevationM,
  },
  {
    key: "meanTemp",
    labelAr: "متوسط الحرارة (°C)",
    labelEn: "Mean Temp (°C)",
    extract: (r) => r.annualMeanTempC,
  },
  {
    key: "summerPeak",
    labelAr: "ذروة الصيف (°C)",
    labelEn: "Summer Peak (°C)",
    extract: (r) => Math.max(...r.monthlyTempC),
  },
  {
    key: "thermalRange",
    labelAr: "المدى الحراري (°C)",
    labelEn: "Thermal Range (°C)",
    extract: (r) =>
      Number(
        (Math.max(...r.monthlyTempC) - Math.min(...r.monthlyTempC)).toFixed(2)
      ),
  },
  {
    key: "rootMoisture",
    labelAr: "رطوبة الجذور",
    labelEn: "Root Moisture",
    extract: (r) => r.meanRootMoisture,
  },
  {
    key: "ndvi",
    labelAr: "مؤشر الخضرة NDVI",
    labelEn: "MODIS NDVI",
    extract: (r) => r.ndvi,
  },
];

export default function RegionalAnalyticsBlogPage() {
  const { isDark, toggleTheme } = useTheme();
  const { isAr, toggleLanguage } = useLanguage();

  const [country, setCountry] = useState<CountryCode>("EG");
  const [heatShiftC, setHeatShiftC] = useState<number>(0);
  const [tempWeightPct, setTempWeightPct] = useState<number>(60);
  const [xAxisKey, setXAxisKey] = useState<FactorKey>("meanTemp");
  const [yAxisKey, setYAxisKey] = useState<FactorKey>("ndvi");

  const activeRegions = useMemo(
    () => REGIONS_DATA.filter((r) => r.country === country),
    [country]
  );

  const suitabilityMatrix = useMemo(() => {
    const wt = tempWeightPct / 100;
    return CROP_RULES.map((crop) => ({
      crop,
      scores: activeRegions.map((reg) =>
        computeCropSuitability(reg, crop, heatShiftC, wt)
      ),
    }));
  }, [activeRegions, heatShiftC, tempWeightPct]);

  const top3PerRegion = useMemo(() => {
    return activeRegions.map((reg, rIdx) => {
      const ranked = CROP_RULES.map((crop, cIdx) => ({
        crop,
        score: suitabilityMatrix[cIdx].scores[rIdx],
      }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
      return { region: reg, topCrops: ranked };
    });
  }, [activeRegions, suitabilityMatrix]);

  const factorVectors = useMemo(() => {
    const map: Record<FactorKey, number[]> = {} as never;
    for (const f of FACTOR_META) {
      map[f.key] = activeRegions.map(f.extract);
    }
    return map;
  }, [activeRegions]);

  const strongestPairs = useMemo(() => {
    const pairs: {
      a: (typeof FACTOR_META)[number];
      b: (typeof FACTOR_META)[number];
      r: number;
    }[] = [];
    for (let i = 0; i < FACTOR_META.length; i++) {
      for (let j = i + 1; j < FACTOR_META.length; j++) {
        if (i === 0 && j === 1) continue;
        const r = pearsonCorrelation(
          factorVectors[FACTOR_META[i].key],
          factorVectors[FACTOR_META[j].key]
        );
        pairs.push({ a: FACTOR_META[i], b: FACTOR_META[j], r });
      }
    }
    return pairs.sort((x, y) => Math.abs(y.r) - Math.abs(x.r)).slice(0, 5);
  }, [factorVectors]);

  const xMeta =
    FACTOR_META.find((f) => f.key === xAxisKey) ?? FACTOR_META[2];
  const yMeta =
    FACTOR_META.find((f) => f.key === yAxisKey) ?? FACTOR_META[6];
  const activeScatterR = useMemo(
    () => pearsonCorrelation(factorVectors[xAxisKey], factorVectors[yAxisKey]),
    [factorVectors, xAxisKey, yAxisKey]
  );

  const axisColor = isDark ? "#94a3b8" : "#475569";
  const gridColor = isDark
    ? "rgba(148, 163, 184, 0.14)"
    : "rgba(15, 23, 42, 0.1)";

  const baseChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: isDark ? "#e2e8f0" : "#0f172a",
          boxWidth: 11,
          font: { family: "Cairo, system-ui, sans-serif", size: 11 },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: axisColor, font: { size: 11 } },
        grid: { color: gridColor },
      },
      y: {
        ticks: { color: axisColor, font: { size: 11 } },
        grid: { color: gridColor },
      },
    },
  };

  // Regression line points for the interactive scatter explorer
  const scatterTrendline = useMemo(() => {
    const xs = factorVectors[xAxisKey];
    const ys = factorVectors[yAxisKey];
    const mx = avg(xs);
    const my = avg(ys);
    let sxy = 0;
    let sxx = 0;
    for (let i = 0; i < xs.length; i++) {
      sxy += (xs[i] - mx) * (ys[i] - my);
      sxx += (xs[i] - mx) ** 2;
    }
    const slope = sxx > 1e-9 ? sxy / sxx : 0;
    const intercept = my - slope * mx;
    const x0 = Math.min(...xs);
    const x1 = Math.max(...xs);
    return [
      { x: x0, y: Number((slope * x0 + intercept).toFixed(3)) },
      { x: x1, y: Number((slope * x1 + intercept).toFixed(3)) },
    ];
  }, [factorVectors, xAxisKey, yAxisKey]);

  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-ground)] text-[var(--text-main)] transition-colors duration-200">
      {/* Sticky Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-[var(--border-panel)] bg-[var(--bg-nav)] backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 shrink-0">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="flex flex-col leading-tight">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
                  {isAr
                    ? "مدونة Field Shift — لوحة التحليل الإحصائي للمناطق"
                    : "Field Shift Blog — Regional EDA & NASA Data Report"}
                </h1>
                <Chip
                  size="sm"
                  variant="flat"
                  color="success"
                  className="h-5 text-[11px]"
                >
                  {isAr ? "تحليل استكشافي (EDA)" : "Exploratory Data Analysis"}
                </Chip>
              </div>
              <span className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                {isAr
                  ? "تحليل مقارن لبيانات NASA POWER وMODIS NDVI ورطوبة منطقة الجذور (GWETROOT)"
                  : "Comparative analysis of NASA POWER, MODIS NDVI, and Root-Zone Soil Moisture (GWETROOT)"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              as={Link}
              href="/"
              size="sm"
              color="success"
              variant="flat"
              startContent={<BackArrow className="h-3.5 w-3.5" />}
              className="font-bold"
            >
              {isAr ? "العودة لقمرة القرار" : "Back to Decision Cockpit"}
            </Button>

            <Button
              as={Link}
              href="/game"
              size="sm"
              variant="bordered"
              color="default"
              startContent={
                <Gamepad2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              }
              className="border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/70 text-slate-800 dark:text-slate-100 hover:border-emerald-500/60 font-semibold"
            >
              {isAr ? "العب المزرعة السعيدة" : "Play ElMazra3a Game"}
            </Button>

            <Button
              size="sm"
              variant="bordered"
              color="default"
              onPress={toggleLanguage}
              startContent={
                <Globe className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              }
              className="border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/70 text-slate-800 dark:text-slate-100 font-semibold"
            >
              {isAr ? "English" : "العربية"}
            </Button>

            <Button
              size="sm"
              variant="bordered"
              color="default"
              onPress={toggleTheme}
              startContent={
                isDark ? (
                  <Sun className="h-3.5 w-3.5 text-amber-400" />
                ) : (
                  <Moon className="h-3.5 w-3.5 text-slate-700" />
                )
              }
              className="border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/70 text-slate-800 dark:text-slate-100 font-medium"
            >
              {isDark
                ? isAr
                  ? "الوضع النهاري"
                  : "Light Mode"
                : isAr
                ? "الوضع الليلي"
                : "Dark Mode"}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1440px] flex-1 p-4 lg:p-6 flex flex-col gap-5">
        {/* Country Filter Bar */}
        <section
          aria-label={isAr ? "اختيار الدولة للتحليل" : "Select Country Dataset"}
          className="hud-panel rounded-2xl p-4 lg:px-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        >
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              aria-pressed={country === "EG"}
              onClick={() => setCountry("EG")}
              className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs sm:text-sm font-bold transition-colors ${
                country === "EG"
                  ? "bg-emerald-500/20 text-emerald-800 border-emerald-500/70 dark:text-emerald-200 dark:border-emerald-400"
                  : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100 dark:bg-[#090f1b] dark:text-slate-300 dark:border-slate-800"
              }`}
            >
              <span>
                {isAr
                  ? "🇪🇬 أقاليم مصر (6 محافظات)"
                  : "🇪🇬 Egypt Regions (6 Governorates)"}
              </span>
            </button>

            <button
              type="button"
              aria-pressed={country === "US"}
              onClick={() => setCountry("US")}
              className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs sm:text-sm font-bold transition-colors ${
                country === "US"
                  ? "bg-sky-500/20 text-sky-800 border-sky-500/70 dark:text-sky-200 dark:border-sky-400"
                  : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100 dark:bg-[#090f1b] dark:text-slate-300 dark:border-slate-800"
              }`}
            >
              <span>
                {isAr
                  ? "🇺🇸 أقاليم أمريكا (3 أحزمة زراعية)"
                  : "🇺🇸 USA Belts (California, Iowa, Kansas)"}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <Satellite className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              {isAr
                ? "تمت إضافة محافظة البحيرة + بيانات 10 سنوات لتجاوز قيود العينة الأولية"
                : "Enhanced with Beheira Governorate + 10-year baseline integration"}
            </span>
          </div>
        </section>

        {/* Regional KPI Cards */}
        <section
          aria-label={isAr ? "ملخص مؤشرات الأقاليم" : "Regional KPI Cards"}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3"
        >
          {activeRegions.map((reg) => {
            const peakTemp = Math.max(...reg.monthlyTempC);
            return (
              <div
                key={reg.id}
                className="hud-panel rounded-xl p-3.5 flex flex-col justify-between gap-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: reg.color }}
                    />
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {isAr ? reg.nameAr : reg.nameEn}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-telemetry">
                    {reg.elevationM}m
                  </span>
                </div>

                <div className="text-xl font-extrabold text-slate-900 dark:text-slate-50 tabular-telemetry">
                  {reg.annualMeanTempC}°C
                </div>

                <div className="flex flex-col gap-1 text-[11px] text-slate-600 dark:text-slate-400 tabular-telemetry pt-1 border-t border-slate-200/70 dark:border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span>{isAr ? "رطوبة الجذور:" : "Root Moisture:"}</span>
                    <strong className="text-sky-700 dark:text-sky-300">
                      {Math.round(reg.meanRootMoisture * 100)}%
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{isAr ? "الغطاء النباتي NDVI:" : "MODIS NDVI:"}</span>
                    <strong className="text-emerald-700 dark:text-emerald-400">
                      {reg.ndvi}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{isAr ? "ذروة الصيف:" : "Summer Peak:"}</span>
                    <strong className="text-amber-700 dark:text-amber-300">
                      {peakTemp}°C
                    </strong>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* Row 1: Monthly Temperature & Monthly Root Moisture Curves */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <section className="hud-panel rounded-2xl p-4 lg:p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {isAr
                    ? "متوسط الحرارة الشهري (°C) — NASA POWER"
                    : "Monthly Mean Temperature (°C) — NASA POWER"}
                </h2>
              </div>
              <Chip size="sm" variant="flat" color="warning" className="text-[11px]">
                {isAr ? "فبراير – ديسمبر" : "Feb – Dec"}
              </Chip>
            </div>
            <div className="h-[260px] w-full">
              <Line
                key={`temp-${country}-${isAr ? "ar" : "en"}-${isDark ? "d" : "l"}`}
                data={{
                  labels: isAr ? MONTHS_AR : MONTHS_EN,
                  datasets: activeRegions.map((r) => ({
                    label: isAr ? r.nameAr : r.nameEn,
                    data: r.monthlyTempC,
                    borderColor: r.color,
                    backgroundColor: r.color,
                    tension: 0.32,
                    pointRadius: 2.5,
                    borderWidth: 2,
                  })),
                }}
                options={baseChartOptions}
              />
            </div>
          </section>

          <section className="hud-panel rounded-2xl p-4 lg:p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {isAr
                    ? "رطوبة منطقة الجذور الشهرية (GWETROOT)"
                    : "Monthly Root-Zone Wetness (GWETROOT)"}
                </h2>
              </div>
              <Chip size="sm" variant="flat" color="primary" className="text-[11px]">
                {isAr ? "كسر تشبع الجذور (0–1)" : "Root Wetness Fraction"}
              </Chip>
            </div>
            <div className="h-[260px] w-full">
              <Line
                key={`gwet-${country}-${isAr ? "ar" : "en"}-${isDark ? "d" : "l"}`}
                data={{
                  labels: isAr ? MONTHS_AR : MONTHS_EN,
                  datasets: activeRegions.map((r) => ({
                    label: isAr ? r.nameAr : r.nameEn,
                    data: r.monthlyGwet,
                    borderColor: r.color,
                    backgroundColor: r.color,
                    tension: 0.32,
                    pointRadius: 2.5,
                    borderWidth: 2,
                  })),
                }}
                options={{
                  ...baseChartOptions,
                  scales: {
                    ...baseChartOptions.scales,
                    y: {
                      ...baseChartOptions.scales.y,
                      min: 0.15,
                      max: country === "US" ? 0.8 : 0.55,
                    },
                  },
                }}
              />
            </div>
          </section>
        </div>

        {/* Row 2: Climate Scenario Controls + Crop Suitability Heatmap (0-100) */}
        <section className="hud-panel rounded-2xl p-4 lg:p-5 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Table2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">
                {isAr
                  ? "مصفوفة ملاءمة المحاصيل للأقاليم (0–100) تحت سيناريو المناخ"
                  : "Regional Crop Suitability Heatmap (0–100) Under Climate Stress"}
              </h2>
            </div>
            <span className="text-xs text-slate-600 dark:text-slate-400">
              {isAr
                ? "حرّك المؤشرات لمحاكاة ارتفاع الحرارة وتغيير وزن الحرارة مقابل المياه"
                : "Adjust sliders to simulate heat stress and re-weight temperature vs. water"}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Scenario Sliders & Top 3 per Region */}
            <div className="lg:col-span-4 hud-subpanel rounded-xl p-4 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                <SlidersHorizontal className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span>
                  {isAr ? "ضوابط سيناريو الفرز الزراعي" : "Agronomic Screening Controls"}
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-amber-700 dark:text-amber-300">
                    {isAr ? "موجة حر إضافية:" : "Extra Heat Shift:"}
                  </span>
                  <span className="font-bold text-amber-700 dark:text-amber-300 tabular-telemetry">
                    +{heatShiftC.toFixed(1)}°C
                  </span>
                </div>
                <Slider
                  aria-label={isAr ? "موجة حر إضافية" : "Extra Heat Shift"}
                  size="sm"
                  color="warning"
                  minValue={0}
                  maxValue={4.5}
                  step={0.5}
                  value={heatShiftC}
                  onChange={(v) => setHeatShiftC(Array.isArray(v) ? v[0] : v)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-sky-700 dark:text-sky-300">
                    {isAr
                      ? "وزن الحرارة في التقييم (مقابل المياه):"
                      : "Temperature Weight (vs. Water):"}
                  </span>
                  <span className="font-bold text-sky-700 dark:text-sky-300 tabular-telemetry">
                    {tempWeightPct}% / {100 - tempWeightPct}%
                  </span>
                </div>
                <Slider
                  aria-label={isAr ? "وزن الحرارة" : "Temperature Weight"}
                  size="sm"
                  color="primary"
                  minValue={0}
                  maxValue={100}
                  step={10}
                  value={tempWeightPct}
                  onChange={(v) =>
                    setTempWeightPct(Array.isArray(v) ? v[0] : v)
                  }
                />
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {isAr
                    ? "أفضل 3 محاصيل لكل منطقة:"
                    : "Top 3 Crops per Region:"}
                </span>
                <div className="flex flex-col gap-2">
                  {top3PerRegion.map(({ region, topCrops }) => (
                    <div
                      key={region.id}
                      className="hud-inset rounded-lg p-2.5 flex flex-col gap-1.5"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold">
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: region.color }}
                        />
                        <span>{isAr ? region.nameAr : region.nameEn}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {topCrops.map(({ crop, score }) => (
                          <span
                            key={crop.id}
                            className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 border border-emerald-500/35 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 dark:text-emerald-200 tabular-telemetry"
                          >
                            <span>{isAr ? crop.nameAr : crop.nameEn}</span>
                            <strong>{score}</strong>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Heatmap Table */}
            <div className="lg:col-span-8 hud-subpanel rounded-xl p-4 overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-300 dark:border-slate-800">
                    <th className="py-2.5 px-3 text-start font-bold text-slate-800 dark:text-slate-200">
                      {isAr ? "المحصول" : "Crop"}
                    </th>
                    {activeRegions.map((reg) => (
                      <th
                        key={reg.id}
                        className="py-2.5 px-2.5 text-center font-bold text-slate-800 dark:text-slate-200"
                      >
                        {isAr ? reg.nameAr : reg.nameEn}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {suitabilityMatrix.map(({ crop, scores }) => (
                    <tr
                      key={crop.id}
                      className="border-b border-slate-200/70 dark:border-slate-800/70"
                    >
                      <td className="py-2 px-3 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        {isAr ? crop.nameAr : crop.nameEn}
                      </td>
                      {scores.map((score, idx) => {
                        const hue = Math.round(score * 1.25);
                        return (
                          <td key={idx} className="p-1.5 text-center">
                            <span
                              className="inline-block w-full rounded-md py-1 px-2 font-bold text-white tabular-telemetry"
                              style={{
                                backgroundColor: `hsl(${hue} 58% 36%)`,
                              }}
                            >
                              {score}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Row 3: Interactive Correlation Explorer + 7x7 Correlation Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* Interactive Variable Scatter Explorer */}
          <section className="lg:col-span-5 hud-panel rounded-2xl p-4 lg:p-5 flex flex-col justify-between gap-3">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {isAr
                      ? "مستكشف العلاقات الإحصائية (مع خط الاتجاه)"
                      : "Interactive Variable Correlation Explorer"}
                  </h2>
                </div>
                <Chip
                  size="sm"
                  variant="flat"
                  color={Math.abs(activeScatterR) >= 0.6 ? "success" : "default"}
                  className="font-bold tabular-telemetry"
                >
                  r = {activeScatterR.toFixed(2)}
                </Chip>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    {isAr ? "المحور الأفقي (X):" : "Horizontal Axis (X):"}
                  </span>
                  <Select
                    aria-label="X Axis Variable"
                    size="sm"
                    variant="bordered"
                    selectedKeys={[xAxisKey]}
                    onSelectionChange={(keys) => {
                      const k = Array.from(keys)[0] as FactorKey | undefined;
                      if (k) setXAxisKey(k);
                    }}
                    classNames={{
                      trigger:
                        "h-8 min-h-8 bg-slate-50 dark:bg-[#090f1b] border-slate-300 dark:border-slate-800",
                      value: "text-xs font-semibold",
                    }}
                  >
                    {FACTOR_META.map((f) => (
                      <SelectItem
                        key={f.key}
                        textValue={isAr ? f.labelAr : f.labelEn}
                      >
                        {isAr ? f.labelAr : f.labelEn}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    {isAr ? "المحور الرأسي (Y):" : "Vertical Axis (Y):"}
                  </span>
                  <Select
                    aria-label="Y Axis Variable"
                    size="sm"
                    variant="bordered"
                    selectedKeys={[yAxisKey]}
                    onSelectionChange={(keys) => {
                      const k = Array.from(keys)[0] as FactorKey | undefined;
                      if (k) setYAxisKey(k);
                    }}
                    classNames={{
                      trigger:
                        "h-8 min-h-8 bg-slate-50 dark:bg-[#090f1b] border-slate-300 dark:border-slate-800",
                      value: "text-xs font-semibold",
                    }}
                  >
                    {FACTOR_META.map((f) => (
                      <SelectItem
                        key={f.key}
                        textValue={isAr ? f.labelAr : f.labelEn}
                      >
                        {isAr ? f.labelAr : f.labelEn}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
              </div>
            </div>

            <div className="h-[250px] w-full">
              <Scatter
                key={`scatter-${country}-${xAxisKey}-${yAxisKey}-${isAr ? "ar" : "en"}-${isDark ? "d" : "l"}`}
                data={{
                  datasets: [
                    ...activeRegions.map((reg, i) => ({
                      label: isAr ? reg.nameAr : reg.nameEn,
                      data: [
                        {
                          x: factorVectors[xAxisKey][i],
                          y: factorVectors[yAxisKey][i],
                        },
                      ],
                      backgroundColor: reg.color,
                      borderColor: reg.color,
                      pointRadius: 7,
                    })),
                    {
                      type: "line" as unknown as "scatter",
                      label: isAr ? "خط الاتجاه" : "Trendline",
                      data: scatterTrendline,
                      borderColor: axisColor,
                      borderDash: [5, 4],
                      pointRadius: 0,
                      borderWidth: 1.5,
                      showLine: true,
                    },
                  ],
                }}
                options={{
                  ...baseChartOptions,
                  scales: {
                    x: {
                      ...baseChartOptions.scales.x,
                      title: {
                        display: true,
                        text: isAr ? xMeta.labelAr : xMeta.labelEn,
                        color: axisColor,
                      },
                    },
                    y: {
                      ...baseChartOptions.scales.y,
                      title: {
                        display: true,
                        text: isAr ? yMeta.labelAr : yMeta.labelEn,
                        color: axisColor,
                      },
                    },
                  },
                }}
              />
            </div>

            <div className="hud-subpanel rounded-lg p-3 flex flex-col gap-1.5">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {isAr
                  ? "أقوى 5 علاقات إحصائية مرصودة:"
                  : "Top 5 Observed Correlations:"}
              </span>
              <ul className="flex flex-col gap-1 text-xs text-slate-700 dark:text-slate-300">
                {strongestPairs.map(({ a, b, r }, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between gap-2 tabular-telemetry"
                  >
                    <span>
                      {isAr ? a.labelAr : a.labelEn} ↔{" "}
                      {isAr ? b.labelAr : b.labelEn}
                    </span>
                    <strong
                      className={
                        r >= 0
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-rose-700 dark:text-rose-400"
                      }
                    >
                      r = {r.toFixed(2)} (
                      {r >= 0
                        ? isAr
                          ? "طردية"
                          : "Positive"
                        : isAr
                        ? "عكسية"
                        : "Inverse"}
                      )
                    </strong>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* 7x7 Correlation Matrix */}
          <section className="lg:col-span-7 hud-panel rounded-2xl p-4 lg:p-5 flex flex-col justify-between gap-3">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {isAr
                      ? "مصفوفة الارتباط بين العوامل المناخية والبيئية (7×7)"
                      : "7×7 Agro-Climatic Factor Correlation Matrix (Pearson r)"}
                  </h2>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isAr
                    ? "أخضر = علاقة طردية (+1) | أحمر = عكسية (-1)"
                    : "Green = Positive (+1) | Red = Inverse (-1)"}
                </span>
              </div>

              <div className="overflow-x-auto hud-subpanel rounded-xl p-3">
                <table className="w-full border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-300 dark:border-slate-800">
                      <th className="py-2 px-2 text-start font-bold">
                        {isAr ? "العامل" : "Factor"}
                      </th>
                      {FACTOR_META.map((f) => (
                        <th
                          key={f.key}
                          className="py-2 px-1.5 text-center font-bold"
                        >
                          {isAr ? f.labelAr : f.labelEn}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {FACTOR_META.map((rowF) => (
                      <tr
                        key={rowF.key}
                        className="border-b border-slate-200/70 dark:border-slate-800/70"
                      >
                        <td className="py-1.5 px-2 font-bold whitespace-nowrap">
                          {isAr ? rowF.labelAr : rowF.labelEn}
                        </td>
                        {FACTOR_META.map((colF) => {
                          const r = pearsonCorrelation(
                            factorVectors[rowF.key],
                            factorVectors[colF.key]
                          );
                          const hue = Math.round((r + 1) * 65);
                          return (
                            <td key={colF.key} className="p-1 text-center">
                              <span
                                className="inline-block w-full rounded py-1 px-1 font-bold text-white tabular-telemetry"
                                style={{
                                  backgroundColor: `hsl(${hue} 52% 36%)`,
                                }}
                              >
                                {r.toFixed(2)}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Intra-Governorate Monthly Temp vs Moisture */}
            <div className="hud-subpanel rounded-xl p-3.5 flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {isAr
                  ? "الحرارة مقابل رطوبة الجذور داخل كل منطقة (شهرياً على مدار السنة):"
                  : "Monthly Intra-Region Temperature vs. Root Moisture Correlation:"}
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {activeRegions.map((reg) => {
                  const r = pearsonCorrelation(
                    reg.monthlyTempC,
                    reg.monthlyGwet
                  );
                  const isConstant =
                    Math.max(...reg.monthlyGwet) -
                      Math.min(...reg.monthlyGwet) <
                    0.005;
                  return (
                    <div
                      key={reg.id}
                      className="hud-inset rounded-lg px-3 py-2 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-1.5 font-bold">
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: reg.color }}
                        />
                        <span>{isAr ? reg.nameAr : reg.nameEn}</span>
                      </div>
                      <span className="text-[11px] text-slate-600 dark:text-slate-400 tabular-telemetry">
                        {isConstant
                          ? isAr
                            ? "رطوبة ثابتة طوال السنة (ري جوفي)"
                            : "Constant moisture year-round"
                          : `r = ${r.toFixed(2)} (${
                              r < -0.5
                                ? isAr
                                  ? "انخفاض رطوبة مع حرارة الصيف"
                                  : "Drops with summer heat"
                                : isAr
                                ? "تغير موسمي طفيف"
                                : "Mild seasonal shift"
                            })`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>

        {/* Row 4: EDA Insights & Data Quality Transparency Report */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <section className="hud-panel rounded-2xl p-4 lg:p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">
                {isAr
                  ? "أهم الاستنتاجات التحليلية (EDA Insights)"
                  : "Key Exploratory Data Analysis (EDA) Findings"}
              </h2>
            </div>

            <ul className="flex flex-col gap-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <li className="hud-subpanel rounded-lg p-3 flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-slate-100">
                    {isAr
                      ? "الوادي الجديد الأكثر إجهاداً مناخياً:"
                      : "New Valley Faces Highest Aridity Stress:"}
                  </strong>{" "}
                  {isAr
                    ? "يسجل رطوبة جذور 21% ومؤشر غطاء نباتي NDVI يبلغ 0.37 (نصف الدلتا تقريباً 0.73) مع ذروة حرارة صيفية تصل إلى 34.2°C في أغسطس، مما يجعل المحاصيل عميقة الجذور (عباد الشمس والذرة الرفيعة والفول) ضرورة حتمية."
                    : "Records 21% root moisture and 0.37 NDVI (roughly half of Nile Delta's 0.73) with an August peak of 34.2°C, making deep-rooted drought-tolerant rotations essential."}
                </div>
              </li>

              <li className="hud-subpanel rounded-lg p-3 flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-slate-100">
                    {isAr
                      ? "تدرج إقليمي واضح من الدلتا إلى الجنوب:"
                      : "Clear Latitudinal Gradient Southward:"}
                  </strong>{" "}
                  {isAr
                    ? "كلما اتجهنا جنوباً وغرباً بعيداً عن دلتا النيل، تنخفض رطوبة الجذور ومؤشر الخضرة NDVI بارتباط طردي قوي (r > 0.90)، بينما يرتفع المدى الحراري السنوي من 16.8°C في الدلتا إلى 20.5°C في الوادي الجديد."
                    : "Moving south and west away from the Nile Delta reduces both root moisture and NDVI with a strong positive correlation (r > 0.90), while expanding annual thermal amplitude from 16.8°C to 20.5°C."}
                </div>
              </li>

              <li className="hud-subpanel rounded-lg p-3 flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-slate-100">
                    {isAr
                      ? "حساسية منخفض الفيوم لفصل الصيف:"
                      : "Fayoum Depression Summer Moisture Drop:"}
                  </strong>{" "}
                  {isAr
                    ? "تهبط رطوبة منطقة الجذور في الفيوم من 0.45 في فبراير إلى 0.34 في يونيو (-24%) بارتباط عكسي قوي مع الحرارة (r = -0.85)، مما يتطلب جدولة ري دقيقة في العروة الصيفية."
                    : "Root-zone moisture in Fayoum drops from 0.45 in February to 0.34 in June (-24%) with a strong inverse correlation to temperature (r = -0.85), requiring careful summer irrigation scheduling."}
                </div>
              </li>
            </ul>
          </section>

          <section className="hud-panel rounded-2xl p-4 lg:p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-50">
                {isAr
                  ? "تنبيهات جودة البيانات وكيف عالجناها هندسياً"
                  : "Data Quality Caveats & How Our Engine Solved Them"}
              </h2>
            </div>

            <ul className="flex flex-col gap-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <li className="hud-subpanel rounded-lg p-3 flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-slate-100">
                    {isAr
                      ? "١. دقة شبكة MERRA-2 في الدلتا (الغربية والدقهلية):"
                      : "1. MERRA-2 Grid Resolution in the Delta:"}
                  </strong>{" "}
                  {isAr
                    ? "في بيانات NASA POWER الخام (0.5° × 0.625°)، تقع طنطا والمنصورة في نفس خلية الشبكة المناخية. عالجنا ذلك في محرك ElMazra3a EL sa3ida بدمج معاملات التربة المحلية وMODIS NDVI عالي الدقة (250m) للتفريق بينهما."
                    : "In raw NASA POWER (0.5° × 0.625°), Gharbia and Dakahlia fall into the same climate grid cell. Our engine resolves this by combining local soil-type factors with 250m MODIS NDVI."}
                </div>
              </li>

              <li className="hud-subpanel rounded-lg p-3 flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-slate-100">
                    {isAr
                      ? "٢. من سنة واحدة (2024) إلى سلسلة 10 سنوات (2015–2024):"
                      : "2. Expanding Single-Year 2024 to 10-Year Series (2015–2024):"}
                  </strong>{" "}
                  {isAr
                    ? "ملف التحليل الأولي احتوى على 11 شهراً فقط من 2024 وهو غير كافٍ لحساب P10/P50/P90. لذلك ربطنا قمرة القرار الرئيسية بـ API ناسا لـ 10 سنوات كاملة (2015–2024) شاملة سنوات القيظ (2016، 2021، 2023، 2024)."
                    : "Single-year 2024 monthly records cannot compute statistical P10/P50/P90 bands. Our main cockpit fetches the full 10-year 2015–2024 NASA POWER series to quantify multi-year climate risk."}
                </div>
              </li>

              <li className="hud-subpanel rounded-lg p-3 flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 dark:text-slate-100">
                    {isAr
                      ? "٣. تمثيل الري الميداني وبيانات الرادار (Sentinel-1 SAR):"
                      : "3. Irrigation Representation & Sentinel-1 SAR Backscatter:"}
                  </strong>{" "}
                  {isAr
                    ? "متغير GWETROOT ناتج نموذج مناخي ولا يعكس ضخ الري المباشر، كما أن لقطة NDVI ليوم واحد لا تمثل المواسم الثلاثة؛ لذا أضفنا محاكاة عجز الري (-45%) وتحليل التشتت الراداري VV/VH المخترق للسحب."
                    : "Model-derived GWETROOT does not capture canal irrigation pumping, and single-date NDVI is a snapshot; we augmented both with interactive water-deficit stress sliders and VV/VH SAR backscatter."}
                </div>
              </li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
