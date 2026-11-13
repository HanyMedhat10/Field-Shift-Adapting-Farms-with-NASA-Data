"use client";

import { useLanguage } from "@/app/providers";
import { Chip } from "@heroui/react";
import { motion } from "framer-motion";
import { CountryCode } from "@/lib/currency";
import { FieldPlotCell, PathwaySimulationResult } from "@/lib/simulationEngine";
import { AlertOctagon, Grid3x3, Sprout } from "lucide-react";
import { useState } from "react";

interface FieldGrid3x3Props {
  pathway: PathwaySimulationResult;
  country?: CountryCode;
}

export function FieldGrid3x3({ pathway, country = "EG" }: FieldGrid3x3Props) {
  const { isAr } = useLanguage();
  const [seasonView, setSeasonView] = useState<1 | 2 | 3>(1);
  const [activePlotIdx, setActivePlotIdx] = useState<number>(0);

  const selectedCell: FieldPlotCell =
    pathway.fieldGrid[activePlotIdx] ?? pathway.fieldGrid[0];

  const getPlotCrop = (cell: FieldPlotCell) =>
    seasonView === 1
      ? cell.season1Crop
      : seasonView === 2
      ? cell.season2Crop
      : cell.season3Crop;

  const activeSeasonCrop = getPlotCrop(selectedCell);

  return (
    <div className="hud-subpanel rounded-lg p-3.5 flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
          <Grid3x3 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>
            {country === "US"
              ? isAr
                ? "شبكة الحقل التفاعلية (1 إيكر / Acre = 9 أحواض)"
                : "Interactive Field Grid (1 Acre = 9 Plots)"
              : isAr
              ? "شبكة الحقل التفاعلية (1 فدان = 9 أحواض)"
              : "Interactive Field Grid (1 Feddan = 9 Plots)"}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {([1, 2, 3] as const).map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={seasonView === s}
              onClick={() => setSeasonView(s)}
              className={`rounded-md px-2 py-0.5 text-[11px] font-semibold transition-colors ${
                seasonView === s
                  ? "bg-emerald-500/20 text-emerald-800 border border-emerald-500/50 dark:text-emerald-300"
                  : "bg-white text-slate-600 border border-slate-300 hover:text-slate-900 dark:bg-[#0d1421] dark:text-slate-400 dark:border-slate-800 dark:hover:text-slate-200"
              }`}
            >
              {isAr ? `موسم ${s}` : `Season ${s}`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {pathway.fieldGrid.map((cell, idx) => {
          const crop = getPlotCrop(cell);
          const isFocused = activePlotIdx === idx;
          return (
            <motion.button
              key={`${pathway.id}-${cell.index}-${seasonView}`}
              type="button"
              aria-pressed={isFocused}
              onClick={() => setActivePlotIdx(idx)}
              initial={{ opacity: 0.7, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.18, delay: idx * 0.015 }}
              className={`flex flex-col items-start justify-between rounded-lg border p-2 text-start transition-colors ${
                cell.hasConflict
                  ? "bg-rose-50 border-rose-400 dark:bg-rose-950/35 dark:border-rose-500/60"
                  : isFocused
                  ? "bg-emerald-50 border-emerald-500 dark:bg-emerald-950/35 dark:border-emerald-400"
                  : "bg-white border-slate-300 hover:border-slate-400 dark:bg-[#0d1421] dark:border-slate-800 dark:hover:border-slate-700"
              }`}
            >
              <div className="flex w-full items-center justify-between gap-1">
                <span className="text-[10px] text-slate-600 dark:text-slate-400 tabular-telemetry">
                  {isAr ? `حوض ${cell.index}` : `Plot ${cell.index}`}
                </span>
                {cell.hasConflict ? (
                  <AlertOctagon className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                ) : (
                  <Sprout
                    className="h-3.5 w-3.5 shrink-0"
                    style={{ color: crop.accentHex }}
                  />
                )}
              </div>

              <span className="mt-1 text-xs font-bold text-slate-900 dark:text-slate-100 truncate w-full">
                {isAr ? crop.nameAr : crop.nameEn}
              </span>

              <div className="mt-1 flex w-full items-center justify-between text-[10px] text-slate-600 dark:text-slate-400 tabular-telemetry">
                <span>{isAr ? crop.familyAr : crop.family}</span>
                <span
                  className={
                    cell.healthScore >= 70
                      ? "text-emerald-700 dark:text-emerald-400 font-bold"
                      : cell.healthScore >= 50
                      ? "text-amber-700 dark:text-amber-300 font-bold"
                      : "text-rose-700 dark:text-rose-400 font-bold"
                  }
                >
                  {cell.healthScore}%
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {selectedCell && (
        <div className="hud-inset flex flex-col gap-1.5 rounded-lg px-3 py-2 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 dark:text-slate-200">
                {isAr ? selectedCell.labelAr : selectedCell.labelEn}
              </span>
              <Chip
                size="sm"
                variant="flat"
                color={selectedCell.hasConflict ? "danger" : "success"}
                className="h-5 text-[11px]"
              >
                {selectedCell.hasConflict
                  ? isAr
                    ? "تعارض عائلة نباتية"
                    : "Botanical Clash"
                  : isAr
                  ? `صحة التربة ${selectedCell.healthScore}%`
                  : `Soil Health ${selectedCell.healthScore}%`}
              </Chip>
            </div>
            <span className="text-slate-700 dark:text-slate-300 font-semibold tabular-telemetry">
              {isAr
                ? `موسم ${seasonView}: ${activeSeasonCrop.nameAr} (${activeSeasonCrop.seasonAr})`
                : `Season ${seasonView}: ${activeSeasonCrop.nameEn} (${activeSeasonCrop.seasonEn})`}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 dark:text-slate-400 tabular-telemetry pt-1 border-t border-slate-200 dark:border-slate-800/70">
            <span>
              {isAr ? "أزوت الموسم:" : "Season Nitrogen:"}{" "}
              <strong
                className={
                  activeSeasonCrop.nitrogenKgPerFeddan >= 0
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-rose-700 dark:text-rose-300"
                }
              >
                {activeSeasonCrop.nitrogenKgPerFeddan >= 0
                  ? `+${activeSeasonCrop.nitrogenKgPerFeddan}`
                  : activeSeasonCrop.nitrogenKgPerFeddan}{" "}
                {isAr ? "كجم" : "kg"}
              </strong>
            </span>
            <span>
              {isAr
                ? `ري الموسم: ${activeSeasonCrop.waterM3PerFeddan} م³`
                : `Season Water: ${activeSeasonCrop.waterM3PerFeddan} m³`}
            </span>
            <span>
              {isAr
                ? `عمق الجذور: ${activeSeasonCrop.rootDepthCm} سم`
                : `Root Depth: ${activeSeasonCrop.rootDepthCm} cm`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
