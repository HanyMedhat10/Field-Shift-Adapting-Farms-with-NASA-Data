"use client";

import { Chip } from "@heroui/react";
import { motion } from "framer-motion";
import { FieldPlotCell, PathwaySimulationResult } from "@/lib/simulationEngine";
import { AlertOctagon, Grid3x3, Sprout } from "lucide-react";
import { useState } from "react";

interface FieldGrid3x3Props {
  pathway: PathwaySimulationResult;
}

export function FieldGrid3x3({ pathway }: FieldGrid3x3Props) {
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
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
          <Grid3x3 className="h-4 w-4 text-emerald-400" />
          <span>شبكة الحقل التفاعلية (1 فدان = 9 أحواض)</span>
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
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50"
                  : "bg-[#090f1b] text-slate-400 border border-slate-800 hover:text-slate-200"
              }`}
            >
              موسم {s}
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
              className={`flex flex-col items-start justify-between rounded-lg border p-2 text-right transition-colors ${
                cell.hasConflict
                  ? "bg-rose-950/35 border-rose-500/60"
                  : isFocused
                  ? "bg-emerald-950/35 border-emerald-400"
                  : "bg-[#090f1b] border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex w-full items-center justify-between gap-1">
                <span className="text-[10px] text-slate-400 tabular-telemetry">
                  حوض {cell.index}
                </span>
                {cell.hasConflict ? (
                  <AlertOctagon className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                ) : (
                  <Sprout
                    className="h-3.5 w-3.5 shrink-0"
                    style={{ color: crop.accentHex }}
                  />
                )}
              </div>

              <span className="mt-1 text-xs font-bold text-slate-100 truncate w-full">
                {crop.nameAr}
              </span>

              <div className="mt-1 flex w-full items-center justify-between text-[10px] text-slate-400 tabular-telemetry">
                <span>{crop.familyAr}</span>
                <span
                  className={
                    cell.healthScore >= 70
                      ? "text-emerald-400 font-bold"
                      : cell.healthScore >= 50
                      ? "text-amber-300 font-bold"
                      : "text-rose-400 font-bold"
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
        <div className="hud-subpanel flex flex-col gap-1.5 rounded-lg px-3 py-2 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-200">
                {selectedCell.labelAr}
              </span>
              <Chip
                size="sm"
                variant="flat"
                color={selectedCell.hasConflict ? "danger" : "success"}
                className="h-5 text-[11px]"
              >
                {selectedCell.hasConflict
                  ? "تعارض عائلة نباتية"
                  : `صحة التربة ${selectedCell.healthScore}%`}
              </Chip>
            </div>
            <span className="text-slate-300 font-semibold tabular-telemetry">
              موسم {seasonView}: {activeSeasonCrop.nameAr} ({activeSeasonCrop.seasonAr})
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 tabular-telemetry pt-1 border-t border-slate-800/70">
            <span>
              أزوت الموسم:{" "}
              <strong
                className={
                  activeSeasonCrop.nitrogenKgPerFeddan >= 0
                    ? "text-emerald-400"
                    : "text-rose-300"
                }
              >
                {activeSeasonCrop.nitrogenKgPerFeddan >= 0
                  ? `+${activeSeasonCrop.nitrogenKgPerFeddan}`
                  : activeSeasonCrop.nitrogenKgPerFeddan}{" "}
                كجم
              </strong>
            </span>
            <span>ري الموسم: {activeSeasonCrop.waterM3PerFeddan} م³</span>
            <span>عمق الجذور: {activeSeasonCrop.rootDepthCm} سم</span>
          </div>
        </div>
      )}
    </div>
  );
}
