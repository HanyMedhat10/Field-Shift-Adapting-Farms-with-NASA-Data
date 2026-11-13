"use client";

import { useLanguage } from "@/app/providers";
import { Card, CardBody, Chip } from "@heroui/react";
import { CountryCode, formatProfitShort } from "@/lib/currency";
import { PathwayId, PathwaySimulationResult } from "@/lib/simulationEngine";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
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
  country?: CountryCode;
}

const ORDERED_IDS: PathwayId[] = ["balanced", "cash", "resilient"];

export function PathwayCards({
  pathways,
  selectedPathwayId,
  onSelectPathway,
  country = "EG",
}: PathwayCardsProps) {
  const { isAr } = useLanguage();
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {ORDERED_IDS.map((pid) => {
        const item = pathways[pid];
        const isSelected = selectedPathwayId === pid;

        const borderClass = isSelected
          ? pid === "balanced"
            ? "border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-950/25"
            : pid === "cash"
            ? "border-rose-500 bg-rose-50 dark:border-rose-400 dark:bg-rose-950/25"
            : "border-sky-500 bg-sky-50 dark:border-sky-400 dark:bg-sky-950/25"
          : "border-slate-300 bg-slate-50 hover:border-slate-400 dark:border-slate-800 dark:bg-[#090f1b] dark:hover:border-slate-700";

        const Icon =
          pid === "balanced"
            ? Sparkles
            : pid === "cash"
            ? AlertTriangle
            : ShieldCheck;

        const conflictText = isAr ? item.conflictDetailsAr : item.conflictDetailsEn;

        return (
          <Card
            key={pid}
            isPressable
            aria-pressed={isSelected}
            onPress={() => onSelectPathway(pid)}
            className={`border transition-colors ${borderClass}`}
            shadow="none"
          >
            <CardBody className="p-3.5 gap-2.5 text-start flex flex-col justify-between">
              <div className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        pid === "balanced"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : pid === "cash"
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-sky-600 dark:text-sky-400"
                      }`}
                    />
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                      {isAr ? item.titleAr : item.titleEn}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Chip
                      size="sm"
                      variant="flat"
                      color={item.colorTheme}
                      className="h-5 text-[11px] font-semibold"
                    >
                      {isAr ? item.badgeAr : item.badgeEn}
                    </Chip>
                    {isSelected && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {isAr ? item.summaryAr : item.summaryEn}
                </p>

                {/* 3-Season Sequence */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs pt-0.5">
                  {item.seasons.map((crop, idx) => (
                    <div
                      key={`${pid}-${crop.id}-${idx}`}
                      className="flex items-center gap-1"
                    >
                      <span className="hud-inset inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-slate-900 dark:text-slate-100 font-semibold">
                        <span>
                          {idx + 1}. {isAr ? crop.nameAr : crop.nameEn}
                        </span>
                        <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">
                          ({isAr ? crop.familyAr : crop.family})
                        </span>
                      </span>
                      {idx < 2 && (
                        <ArrowIcon className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-slate-200 dark:border-slate-800/80">
                <div className="flex items-center justify-between gap-2 text-xs tabular-telemetry">
                  <span className="text-slate-700 dark:text-slate-300">
                    {isAr ? "المتوسط المتوقع:" : "Expected Median:"}{" "}
                    <strong className="text-slate-950 dark:text-slate-50">
                      {formatProfitShort(item.p50Egp, country, isAr)}
                    </strong>
                  </span>
                  <span className="text-amber-700 dark:text-amber-300">
                    {isAr ? "أسوأ سنة:" : "Worst Year:"}{" "}
                    <strong>
                      {formatProfitShort(item.p10Egp, country, isAr)}
                    </strong>
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 text-[11px] tabular-telemetry">
                  <span
                    className={`flex items-center gap-1 font-semibold ${
                      item.netUreaBags >= 0
                        ? "text-emerald-700 dark:text-emerald-300"
                        : "text-rose-700 dark:text-rose-300"
                    }`}
                  >
                    <PackageCheck className="h-3.5 w-3.5" />
                    {item.ureaSacksSaved > 0
                      ? isAr
                        ? `توفير ${item.ureaSacksSaved} شكارة يوريا`
                        : `Save ${item.ureaSacksSaved} Urea Sacks`
                      : item.netUreaBags < 0
                      ? isAr
                        ? `يحتاج ${Math.abs(item.netUreaBags)} شكارة يوريا إضافية`
                        : `Needs +${Math.abs(item.netUreaBags)} Urea Sacks`
                      : isAr
                      ? "متعادل سمادياً"
                      : "Nitrogen Neutral"}
                  </span>

                  <span className="flex items-center gap-1 text-sky-700 dark:text-sky-300 font-semibold">
                    <Droplets className="h-3.5 w-3.5" />
                    {isAr
                      ? `توفير ${item.waterSavedPct}% ماء`
                      : `Save ${item.waterSavedPct}% Water`}
                  </span>
                </div>

                {item.hasFamilyConflict && conflictText && (
                  <div className="flex items-start gap-1.5 rounded-md bg-rose-500/10 border border-rose-500/35 px-2.5 py-1.5 text-[11px] text-rose-800 dark:text-rose-200 leading-snug">
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <span>{conflictText}</span>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}
