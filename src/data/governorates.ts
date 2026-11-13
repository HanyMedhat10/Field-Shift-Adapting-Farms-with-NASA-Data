import { CountryCode } from "@/lib/currency";

export type { CountryCode };

export interface GovernorateInfo {
  id: string;
  country: CountryCode;
  nameAr: string;
  nameEn: string;
  regionAr: string;
  regionEn: string;
  soilTypeAr: string;
  soilTypeEn: string;
  lat: number;
  lon: number;
  baselineTempC: number;
  baselineNdvi: number;
  baselineSmapRoot: number;
  waterStressFactor: number;
}

export const GOVERNORATES: GovernorateInfo[] = [
  {
    id: "gharbia",
    country: "EG",
    nameAr: "دلتا النيل — الغربية",
    nameEn: "Nile Delta — Gharbia",
    regionAr: "وسط الدلتا — طنطا",
    regionEn: "Central Delta — Tanta",
    soilTypeAr: "طينية خصبة عميقة",
    soilTypeEn: "Deep fertile clay",
    lat: 30.8754,
    lon: 31.0335,
    baselineTempC: 21.4,
    baselineNdvi: 0.72,
    baselineSmapRoot: 0.58,
    waterStressFactor: 1.0,
  },
  {
    id: "dakahlia",
    country: "EG",
    nameAr: "الدقهلية",
    nameEn: "Dakahlia",
    regionAr: "شمال شرق الدلتا — المنصورة",
    regionEn: "Northeast Delta — Mansoura",
    soilTypeAr: "رسوبية ثقيلة عالية الخصوبة",
    soilTypeEn: "Heavy high-fertility alluvial",
    lat: 31.0409,
    lon: 31.3785,
    baselineTempC: 21.1,
    baselineNdvi: 0.74,
    baselineSmapRoot: 0.62,
    waterStressFactor: 0.96,
  },
  {
    id: "beheira",
    country: "EG",
    nameAr: "البحيرة",
    nameEn: "Beheira",
    regionAr: "غرب الدلتا — النوبارية ودمنهور",
    regionEn: "West Delta — Nubariya & Damanhour",
    soilTypeAr: "طينية رملية مستصلحة",
    soilTypeEn: "Reclaimed sandy-clay",
    lat: 30.8481,
    lon: 30.3436,
    baselineTempC: 21.6,
    baselineNdvi: 0.66,
    baselineSmapRoot: 0.49,
    waterStressFactor: 1.06,
  },
  {
    id: "minya",
    country: "EG",
    nameAr: "المنيا",
    nameEn: "Minya",
    regionAr: "مصر الوسطى — وادي النيل",
    regionEn: "Middle Egypt — Nile Valley",
    soilTypeAr: "طينية صفراء دافئة",
    soilTypeEn: "Warm yellow clay-loam",
    lat: 28.1099,
    lon: 30.7503,
    baselineTempC: 23.2,
    baselineNdvi: 0.63,
    baselineSmapRoot: 0.45,
    waterStressFactor: 1.12,
  },
  {
    id: "fayoum",
    country: "EG",
    nameAr: "الفيوم",
    nameEn: "Fayoum",
    regionAr: "منخفض الفيوم — سنورس",
    regionEn: "Fayoum Depression — Sinnuris",
    soilTypeAr: "طينية جيرية متأثرة بالصرف",
    soilTypeEn: "Calcareous clay with drainage sensitivity",
    lat: 29.3084,
    lon: 30.8428,
    baselineTempC: 22.7,
    baselineNdvi: 0.59,
    baselineSmapRoot: 0.42,
    waterStressFactor: 1.15,
  },
  {
    id: "new_valley",
    country: "EG",
    nameAr: "الوادي الجديد",
    nameEn: "New Valley",
    regionAr: "الواحات — الخارجة والداخلة",
    regionEn: "Oases — Kharga & Dakhla",
    soilTypeAr: "رملية طفلية جافة (ري جوفي)",
    soilTypeEn: "Arid sandy-loam (groundwater irrigation)",
    lat: 25.4514,
    lon: 30.5463,
    baselineTempC: 25.4,
    baselineNdvi: 0.38,
    baselineSmapRoot: 0.24,
    waterStressFactor: 1.28,
  },
  {
    id: "us_california",
    country: "US",
    nameAr: "وادي كاليفورنيا الأوسط",
    nameEn: "California Central Valley",
    regionAr: "فريزنو — كاليفورنيا، أمريكا",
    regionEn: "Fresno Basin — California, USA",
    soilTypeAr: "طينية طميية مروية (وادي سان هواكين)",
    soilTypeEn: "Irrigated alluvial clay-loam (San Joaquin)",
    lat: 36.7378,
    lon: -119.7871,
    baselineTempC: 18.2,
    baselineNdvi: 0.68,
    baselineSmapRoot: 0.48,
    waterStressFactor: 1.14,
  },
  {
    id: "us_iowa",
    country: "US",
    nameAr: "حزام الذرة — أيوا",
    nameEn: "Iowa Corn Belt",
    regionAr: "دي موين / أيمز — أيوا، أمريكا",
    regionEn: "Des Moines / Ames — Iowa, USA",
    soilTypeAr: "تربة البراري السوداء عالية الخصوبة",
    soilTypeEn: "Deep fertile prairie Mollisol",
    lat: 41.878,
    lon: -93.0977,
    baselineTempC: 10.4,
    baselineNdvi: 0.79,
    baselineSmapRoot: 0.67,
    waterStressFactor: 0.88,
  },
  {
    id: "us_kansas",
    country: "US",
    nameAr: "حزام القمح — كانساس",
    nameEn: "Kansas Wheat Belt",
    regionAr: "السهول الكبرى — حوض أوجالالا، أمريكا",
    regionEn: "Great Plains — Ogallala Aquifer, USA",
    soilTypeAr: "طفلية سهلية (مياه جوفية)",
    soilTypeEn: "Great Plains silt-loam (Ogallala aquifer)",
    lat: 38.5266,
    lon: -98.7645,
    baselineTempC: 13.6,
    baselineNdvi: 0.58,
    baselineSmapRoot: 0.43,
    waterStressFactor: 1.16,
  },
];

export const FEATURED_PRESET_IDS: Record<CountryCode, string[]> = {
  EG: ["gharbia", "minya", "new_valley"],
  US: ["us_california", "us_iowa", "us_kansas"],
};

export function findNearestGovernorate(lat: number, lon: number): GovernorateInfo {
  let nearest = GOVERNORATES[0];
  let minDist = Number.POSITIVE_INFINITY;
  for (const gov of GOVERNORATES) {
    const d = Math.hypot(gov.lat - lat, gov.lon - lon);
    if (d < minDist) {
      minDist = d;
      nearest = gov;
    }
  }
  return nearest;
}
