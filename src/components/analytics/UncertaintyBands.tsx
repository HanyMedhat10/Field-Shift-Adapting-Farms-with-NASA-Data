"use client";

import { Chip } from "@heroui/react";
import { AnnualClimateRecord } from "@/data/nasaFallback";
import { PathwaySimulationResult } from "@/lib/simulationEngine";
import { Activity, CheckCircle2, ShieldAlert, TrendingUp } from "lucide-react";

interface UncertaintyBandsProps {
  selectedPathway: PathwaySimulationResult;
  cashPathway: PathwaySimulationResult;
  annualRecords: AnnualClimateRecord[];
}

export function UncertaintyBands({
  selectedPathway,
  cashPathway,
  annualRecords,
}: UncertaintyBandsProps) {
  const maxReference = Math.max(
    selectedPathway.p90Egp,
    cashPathway.p90Egp,
    130000
  );

  const calcPct = (val: number) =>
    Math.min(100, Math.max(8, Math.round((val / maxReference) * 100)));

  const p10Width = calcPct(selectedPathway.p10Egp);
  const p50Width = calcPct(selectedPathway.p50Egp);
  const p90Width = calcPct(selectedPathway.p90Egp);

  const cashP10Width = calcPct(cashPathway.p10Egp);
  const cashP50Width = calcPct(cashPathway.p50Egp);
  const cashP90Width = calcPct(cashPathway.p90Egp);

  const showCashMarker = selectedPathway.id !== "cash";
  const p10Advantage = selectedPathway.p10Egp - cashPathway.p10Egp;

  const maxAnnualProfit = Math.max(
    ...selectedPathway.annualProfitsEgp,
    120000
  );

  return (
    <div className="hud-subpanel rounded-lg p-3.5 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
          <Activity className="h-4 w-4 text-sky-400" />
          <span>توقعات الربح والمخاطر عبر 10 سنوات (P10 / P50 / P90)</span>
        </div>

        <Chip
          size="sm"
          variant="flat"
          color={selectedPathway.cvPct <= 14 ? "success" : "warning"}
          className="h-5 text-[11px] font-bold tabular-telemetry"
        >
          تذبذب {selectedPathway.cvPct}%
        </Chip>
      </div>

      <div className="flex flex-col gap-2.5 text-xs">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-rose-300 font-medium">
              أسوأ سنة مناخية (P10)
            </span>
            <span className="font-bold text-rose-300 tabular-telemetry">
              {selectedPathway.p10Egp.toLocaleString("en-US")} ج/فدان
            </span>
          </div>
          <div className="relative h-2.5 w-full rounded-full bg-slate-900 overflow-hidden">
            <div
              className="h-full rounded-full bg-rose-500 transition-all duration-300"
              style={{ width: `${p10Width}%` }}
            />
            {showCashMarker && (
              <div
                title={`أسوأ سنة للمسار النقدي: ${cashPathway.p10Egp.toLocaleString("en-US")} ج`}
                className="absolute top-0 bottom-0 w-0.5 bg-amber-300"
                style={{ insetInlineStart: `${cashP10Width}%` }}
              />
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-emerald-300 font-medium">
              المتوسط المتوقع (P50)
            </span>
            <span className="font-bold text-emerald-300 tabular-telemetry">
              {selectedPathway.p50Egp.toLocaleString("en-US")} ج/فدان
            </span>
          </div>
          <div className="relative h-2.5 w-full rounded-full bg-slate-900 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${p50Width}%` }}
            />
            {showCashMarker && (
              <div
                title={`متوسط المسار النقدي: ${cashPathway.p50Egp.toLocaleString("en-US")} ج`}
                className="absolute top-0 bottom-0 w-0.5 bg-amber-300"
                style={{ insetInlineStart: `${cashP50Width}%` }}
              />
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-sky-300 font-medium">
              أفضل موسم (P90)
            </span>
            <span className="font-bold text-sky-300 tabular-telemetry">
              {selectedPathway.p90Egp.toLocaleString("en-US")} ج/فدان
            </span>
          </div>
          <div className="relative h-2.5 w-full rounded-full bg-slate-900 overflow-hidden">
            <div
              className="h-full rounded-full bg-sky-500 transition-all duration-300"
              style={{ width: `${p90Width}%` }}
            />
            {showCashMarker && (
              <div
                title={`أفضل موسم للمسار النقدي: ${cashPathway.p90Egp.toLocaleString("en-US")} ج`}
                className="absolute top-0 bottom-0 w-0.5 bg-amber-300"
                style={{ insetInlineStart: `${cashP90Width}%` }}
              />
            )}
          </div>
        </div>

        {showCashMarker && (
          <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400">
            <span>الشرطة الصفراء توضح مستوى المسار النقدي</span>
            <span className="flex items-center gap-1 text-emerald-300 font-semibold tabular-telemetry">
              <TrendingUp className="h-3.5 w-3.5" />
              أمان إضافي في أسوأ سنة: {p10Advantage >= 0 ? `+${p10Advantage.toLocaleString("en-US")}` : p10Advantage.toLocaleString("en-US")} ج
            </span>
          </div>
        )}
      </div>

      {/* 10-Year Historical Profit Strip (2015–2024) */}
      <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>محاكاة كل سنة من آخر 10 سنوات (2015–2024)</span>
          <span className="text-amber-300">البرتقالي = سنة موجة حر</span>
        </div>
        <div className="grid grid-cols-10 gap-1 items-end h-11 pt-1">
          {selectedPathway.annualProfitsEgp.map((profit, idx) => {
            const yr = annualRecords[idx];
            const isHeatYear = (yr?.tempAnomalyC ?? 0) >= 0.5;
            const heightPct = Math.max(
              22,
              Math.round((profit / maxAnnualProfit) * 100)
            );
            return (
              <div
                key={yr?.year ?? idx}
                title={`${yr?.year ?? 2015 + idx}: ${profit.toLocaleString("en-US")} ج/فدان`}
                className="flex flex-col items-center justify-end h-full gap-0.5"
              >
                <div
                  className={`w-full rounded-t-sm transition-all duration-300 ${
                    selectedPathway.id === "cash"
                      ? isHeatYear
                        ? "bg-rose-500"
                        : "bg-rose-400/70"
                      : isHeatYear
                      ? "bg-amber-400"
                      : "bg-emerald-500/80"
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
                <span className="text-[9px] text-slate-500 tabular-telemetry leading-none">
                  {String(yr?.year ?? 2015 + idx).slice(2)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Plain-Arabic 3-line summary explaining why this protects pocket & soil */}
      <div className="rounded-lg bg-[#0d1421] border border-slate-800 p-3 flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-100">
          {selectedPathway.id === "cash" ? (
            <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          )}
          <span>لماذا يحمي هذا المسار جيبك وأرضك؟</span>
        </div>
        <ul className="flex flex-col gap-1.5 text-xs text-slate-300 leading-relaxed">
          {selectedPathway.plainSummaryLinesAr.map((line, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
