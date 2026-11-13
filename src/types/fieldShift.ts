import { GovernorateInfo } from "@/data/governorates";
import { AnnualClimateRecord, MultiScaleTelemetry } from "@/data/nasaFallback";
import { PreviousCropId } from "@/data/cropsMatrix";
import { PathwayId, PathwaySimulationResult } from "@/lib/simulationEngine";

export interface FieldShiftApiResponse {
  governorate: GovernorateInfo;
  coordinates: { lat: number; lon: number };
  prevCropId: PreviousCropId;
  heatStressC: number;
  waterDeficitPct: number;
  selectedPathwayId: PathwayId;
  multiScale: MultiScaleTelemetry;
  annualRecords: AnnualClimateRecord[];
  pathways: Record<PathwayId, PathwaySimulationResult>;
  hudMetrics: {
    soilHealthScore: number;
    ureaSacksSaved: number;
    waterSavedPct: number;
    colorTheme: "success" | "danger" | "primary";
  };
  sourceStatus: {
    powerLive: boolean;
    asfLive: boolean;
    modeLabelAr: string;
    modeLabelEn: string;
  };
  rawJson: unknown;
}

export interface CopilotApiResponse {
  mode: "gemini-live" | "offline-agronomic-advisor";
  headlineAr: string;
  headlineEn: string;
  adviceAr: string;
  adviceEn: string;
  actionChecklistAr: string[];
  actionChecklistEn: string[];
}

