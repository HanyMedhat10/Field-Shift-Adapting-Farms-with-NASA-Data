export interface GovernorateInfo {
  id: string;
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
    nameAr: "الغربية",
    nameEn: "Gharbia",
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
];

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

