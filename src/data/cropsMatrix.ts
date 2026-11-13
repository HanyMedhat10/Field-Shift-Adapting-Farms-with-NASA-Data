export type BotanicalFamily =
  | "Poaceae"
  | "Fabaceae"
  | "Solanaceae"
  | "Amaranthaceae"
  | "Asteraceae";

export interface CropInfo {
  id: string;
  nameAr: string;
  nameEn: string;
  family: BotanicalFamily;
  familyAr: string;
  seasonAr: string;
  /** Net nitrogen impact in kg N/feddan (+ fixes nitrogen, - depletes nitrogen) */
  nitrogenKgPerFeddan: number;
  /** Irrigation water demand in m³/feddan */
  waterM3PerFeddan: number;
  /** Baseline net profit in EGP/feddan under normal Egyptian climate */
  baseProfitEgp: number;
  /** Maximum additional heat anomaly (°C) tolerated before sharp yield drop */
  heatToleranceC: number;
  /** Maximum irrigation deficit (%) tolerated before severe stress */
  droughtTolerancePct: number;
  /** Soil pest/pathogen cycle interruption score (0-100) */
  pestBreakScore: number;
  /** Effective rooting depth in cm */
  rootDepthCm: number;
  /** Color token used in the field grid and badges */
  accentHex: string;
}

export const CROPS_MATRIX: Record<string, CropInfo> = {
  wheat: {
    id: "wheat",
    nameAr: "قمح",
    nameEn: "Wheat",
    family: "Poaceae",
    familyAr: "النجيلية",
    seasonAr: "شتوي",
    nitrogenKgPerFeddan: -46,
    waterM3PerFeddan: 1850,
    baseProfitEgp: 36000,
    heatToleranceC: 2.0,
    droughtTolerancePct: 20,
    pestBreakScore: 55,
    rootDepthCm: 90,
    accentHex: "#eab308",
  },
  fava: {
    id: "fava",
    nameAr: "فول بلدي",
    nameEn: "Fava Bean",
    family: "Fabaceae",
    familyAr: "البقولية",
    seasonAr: "شتوي",
    nitrogenKgPerFeddan: 55,
    waterM3PerFeddan: 1450,
    baseProfitEgp: 34000,
    heatToleranceC: 2.5,
    droughtTolerancePct: 35,
    pestBreakScore: 88,
    rootDepthCm: 100,
    accentHex: "#34d399",
  },
  berseem: {
    id: "berseem",
    nameAr: "برسيم حجازي",
    nameEn: "Alfalfa / Berseem",
    family: "Fabaceae",
    familyAr: "البقولية",
    seasonAr: "شتوي / معمر",
    nitrogenKgPerFeddan: 69,
    waterM3PerFeddan: 2050,
    baseProfitEgp: 33000,
    heatToleranceC: 2.4,
    droughtTolerancePct: 28,
    pestBreakScore: 92,
    rootDepthCm: 120,
    accentHex: "#10b981",
  },
  soybean: {
    id: "soybean",
    nameAr: "فول صويا",
    nameEn: "Soybean",
    family: "Fabaceae",
    familyAr: "البقولية",
    seasonAr: "صيفي",
    nitrogenKgPerFeddan: 50,
    waterM3PerFeddan: 1900,
    baseProfitEgp: 37000,
    heatToleranceC: 2.8,
    droughtTolerancePct: 28,
    pestBreakScore: 86,
    rootDepthCm: 115,
    accentHex: "#22c55e",
  },
  maize: {
    id: "maize",
    nameAr: "ذرة شامية",
    nameEn: "Maize",
    family: "Poaceae",
    familyAr: "النجيلية",
    seasonAr: "صيفي",
    nitrogenKgPerFeddan: -55,
    waterM3PerFeddan: 2700,
    baseProfitEgp: 39000,
    heatToleranceC: 2.3,
    droughtTolerancePct: 18,
    pestBreakScore: 50,
    rootDepthCm: 105,
    accentHex: "#fbbf24",
  },
  potato: {
    id: "potato",
    nameAr: "بطاطس",
    nameEn: "Potato",
    family: "Solanaceae",
    familyAr: "الباذنجانية",
    seasonAr: "نيلي / شتوي",
    nitrogenKgPerFeddan: -65,
    waterM3PerFeddan: 2550,
    baseProfitEgp: 55000,
    heatToleranceC: 1.2,
    droughtTolerancePct: 12,
    pestBreakScore: 35,
    rootDepthCm: 55,
    accentHex: "#f59e0b",
  },
  tomato: {
    id: "tomato",
    nameAr: "طماطم",
    nameEn: "Tomato",
    family: "Solanaceae",
    familyAr: "الباذنجانية",
    seasonAr: "صيفي / عروة",
    nitrogenKgPerFeddan: -60,
    waterM3PerFeddan: 2750,
    baseProfitEgp: 52000,
    heatToleranceC: 1.5,
    droughtTolerancePct: 14,
    pestBreakScore: 38,
    rootDepthCm: 65,
    accentHex: "#f43f5e",
  },
  sunflower: {
    id: "sunflower",
    nameAr: "عباد شمس",
    nameEn: "Sunflower",
    family: "Asteraceae",
    familyAr: "النجمية",
    seasonAr: "صيفي / نيلي",
    nitrogenKgPerFeddan: -23,
    waterM3PerFeddan: 1400,
    baseProfitEgp: 35000,
    heatToleranceC: 4.2,
    droughtTolerancePct: 45,
    pestBreakScore: 89,
    rootDepthCm: 170,
    accentHex: "#0ea5e9",
  },
  sugarbeet: {
    id: "sugarbeet",
    nameAr: "بنجر سكر",
    nameEn: "Sugar Beet",
    family: "Amaranthaceae",
    familyAr: "الرمرامية",
    seasonAr: "شتوي",
    nitrogenKgPerFeddan: -30,
    waterM3PerFeddan: 1600,
    baseProfitEgp: 42000,
    heatToleranceC: 3.6,
    droughtTolerancePct: 40,
    pestBreakScore: 84,
    rootDepthCm: 150,
    accentHex: "#38bdf8",
  },
};

export type PreviousCropId = "wheat" | "potato" | "tomato" | "maize";

export const PREVIOUS_CROPS: { id: PreviousCropId; labelAr: string }[] = [
  { id: "wheat", labelAr: "قمح" },
  { id: "potato", labelAr: "بطاطس" },
  { id: "tomato", labelAr: "طماطم" },
  { id: "maize", labelAr: "ذرة" },
];
