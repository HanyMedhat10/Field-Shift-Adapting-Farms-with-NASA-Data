"use client";

import { Card, CardBody, Chip } from "@heroui/react";
import { PathwayId, PathwaySimulationResult } from "@/lib/simulationEngine";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Droplets,
  PackageCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

interface PathwayCardsProps {
  pathways: Record<PathwayId, PathwaySimulationResult>;
  selectedPathwayId: PathwayId;
  onSelectPathway: (id: PathwayId) => void;
}

const ORDERED_IDS: PathwayId[] = ["balanced", "cash", "resilient"];

export function PathwayCards({
  pathways,
  selectedPathwayId,
  onSelectPathway,
}: PathwayCardsProps) {
  return (
    <div className="flex flex-col gap-2">
      {ORDERED_IDS.map((pid) => {
        const item = pathways[pid];
        const isSelected = selectedPathwayId === pid;

        const borderClass = isSelected
          ? pid === "balanced"
            ? "border-emerald-400 bg-emerald-950/25"
            : pid === "cash"
            ? "border-rose-400 bg-rose-950/25"
            : "border-sky-400 bg-sky-950/25"
          : "border-slate-800 bg-[#090f1b] hover:border-slate-700";

        const Icon =
          pid === "balanced"
            ? Sparkles
            : pid === "cash"
            ? AlertTriangle
            : ShieldCheck;

        return (
          <Card
            key={pid}
            isPressable
            aria-pressed={isSelected}
            onPress={() => onSelectPathway(pid)}
            className={`border transition-colors ${borderClass}`}
            shadow="none"
          >
            <CardBody className="p-3 gap-2 text-right">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      pid === "balanced"
                        ? "text-emerald-400"
                        : pid === "cash"
                        ? "text-rose-400"
                        : "text-sky-400"
                    }`}
                  />
                  <span className="text-sm font-bold text-slate-100">
                    {item.titleAr}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Chip
                    size="sm"
                    variant="flat"
                    color={item.colorTheme}
                    className="h-5 text-[11px] font-semibold"
                  >
                    {item.badgeAr}
                  </Chip>
                  {isSelected && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  )}
                </div>
              </div>

              {/* 3-Season Sequence with Botanical Family Pills */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {item.seasons.map((crop, idx) => (
                  <div
                    key={`${pid}-${crop.id}-${idx}`}
                    className="flex items-center gap-1"
                  >
                    <span className="inline-flex items-center gap-1 rounded-md bg-[#0d1421] border border-slate-700/80 px-2 py-0.5 text-slate-200 font-medium">
                      <span>
                        {idx + 1}. {crop.nameAr}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        ({crop.familyAr})
                      </span>
                    </span>
                    {idx < 2 && <ArrowLeft className="h-3 w-3 text-slate-500" />}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-slate-800/80 text-[11px]">
                <div className="flex items-center gap-2 text-slate-300 tabular-telemetry">
                  <span>
                    P10:{" "}
                    <strong className="text-amber-300">
                      {item.p10Egp.toLocaleString("en-US")} ج
                    </strong>
                  </span>
                  <span className="text-slate-600">|</span>
                  <span>
                    P50:{" "}
                    <strong className="text-slate-50">
                      {item.p50Egp.toLocaleString("en-US")} ج
                    </strong>
                  </span>
                </div>

                <div className="flex items-center gap-2 tabular-telemetry">
                  {item.ureaSacksSaved > 0 && (
                    <span className="flex items-center gap-1 text-emerald-300 font-semibold">
                      <PackageCheck className="h-3 w-3" />
                      +{item.ureaSacksSaved} شكارة
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-sky-300 font-semibold">
                    <Droplets className="h-3 w-3" />
                    {item.waterSavedPct}% ماء
                  </span>
                </div>
              </div>

              {item.hasFamilyConflict && item.conflictDetailsAr && (
                <div className="flex items-start gap-1.5 rounded-md bg-rose-500/10 border border-rose-500/35 px-2.5 py-1.5 text-[11px] text-rose-200 leading-snug">
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <span>{item.conflictDetailsAr}</span>
                </div>
              )}
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}
