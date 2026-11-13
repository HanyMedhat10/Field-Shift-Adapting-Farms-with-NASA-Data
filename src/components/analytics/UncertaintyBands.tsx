"use client";

import { Chip } from "@heroui/react";
import { AnnualClimateRecord } from "@/data/nasaFallback";
import { PathwaySimulationResult } from "@/lib/simulationEngine";
import { Activity, ShieldAlert, TrendingUp } from "lucide-react";

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
    <div className="hud-subpanel rounded-lg p-3 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
          <Activity className="h-4 w-4 text-sky-400" />
          <span>نطاقات عدم اليقين (10 سنوات ناسا)</span>
        </div>

        <Chip
          size="sm"
          variant="flat"
          color={selectedPathway.cvPct <= 14 ? "success" : "warning"}
          className="h-5 text-[11px] font-bold tabular-telemetry"
        >
          تذبذب CV {selectedPathway.cvPct}%
        </Chip>
      </div>

      <div className="flex flex-col gap-2.5 text-xs">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-rose-300 font-medium">
              P10 (أسوأ سنة مناخية)
            </span>
            <span className="font-bold text-rose-300 tabular-telemetry">
              {selectedPathway.p10Egp.toLocaleString("en-US")} ج/فدان
            </span>
          </div>
          <div className="relative h-2 w-full rounded-full bg-slate-900 overflow-hidden">
            <div
              className="h-full rounded-full bg-rose-500 transition-all duration-300"
              style={{ width: `${p10Width}%` }}
            />
            {showCashMarker && (
              <div
                title={`المسار النقدي P10: ${cashPathway.p10Egp.toLocaleString("en-US")} ج`}
                className="absolute top-0 bottom-0 w-0.5 bg-amber-300"
                style={{ insetInlineStart: `${cashP10Width}%` }}
              />
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-emerald-300 font-medium">
              P50 (المتوسط المتوقع)
            </span>
            <span className="font-bold text-emerald-300 tabular-telemetry">
              {selectedPathway.p50Egp.toLocaleString("en-US")} ج/فدان
            </span>
          </div>
          <div className="relative h-2 w-full rounded-full bg-slate-900 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${p50Width}%` }}
            />
            {showCashMarker && (
              <div
                title={`المسار النقدي P50: ${cashPathway.p50Egp.toLocaleString("en-US")} ج`}
                className="absolute top-0 bottom-0 w-0.5 bg-amber-300"
                style={{ insetInlineStart: `${cashP50Width}%` }}
              />
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-sky-300 font-medium">
              P90 (أفضل سنة مناخية)
            </span>
            <span className="font-bold text-sky-300 tabular-telemetry">
              {selectedPathway.p90Egp.toLocaleString("en-US")} ج/فدان
            </span>
          </div>
          <div className="relative h-2 w-full rounded-full bg-slate-900 overflow-hidden">
            <div
              className="h-full rounded-full bg-sky-500 transition-all duration-300"
              style={{ width: `${p90Width}%` }}
            />
            {showCashMarker && (
              <div
                title={`المسار النقدي P90: ${cashPathway.p90Egp.toLocaleString("en-US")} ج`}
                className="absolute top-0 bottom-0 w-0.5 bg-amber-300"
                style={{ insetInlineStart: `${cashP90Width}%` }}
              />
            )}
          </div>
        </div>

        {showCashMarker && (
          <div className="flex items-center justify-end gap-1.5 text-[10px] text-slate-400">
            <span className="inline-block h-2.5 w-0.5 bg-amber-300" />
            <span>الخط المرجعي الأصفر = مستوى المسار النقدي</span>
          </div>
        )}
      </div>

      {/* 10-Year Historical Profit Strip (2015–2024) */}
      <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>أداء المحاكاة عبر آخر 10 سنوات (NASA POWER)</span>
          <span className="text-amber-300">الأعمدة الكهرمانية = سنوات موجات حر</span>
        </div>
        <div className="grid grid-cols-10 gap-1 items-end h-12 pt-1">
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
                title={`${yr?.year ?? 2015 + idx}: ${profit.toLocaleString("en-US")} ج/فدان (شذوذ ${yr?.tempAnomalyC ?? 0}°C)`}
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

      {selectedPathway.id !== "cash" ? (
        <div className="flex items-center justify-between rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1.5 text-[11px] text-emerald-200 tabular-telemetry">
          <span className="flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            أمان الدخل في أسوأ سنة مقابل النقدي:
          </span>
          <strong className="text-emerald-300">
            {p10Advantage >= 0
              ? `+${p10Advantage.toLocaleString("en-US")} ج`
              : `${p10Advantage.toLocaleString("en-US")} ج`}
          </strong>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 rounded-md bg-rose-500/10 border border-rose-500/30 px-2.5 py-1.5 text-[11px] text-rose-200">
          <ShieldAlert className="h-3.5 w-3.5 text-rose-400 shrink-0" />
          <span>
            تذبذب عالٍ: المسار النقدي يخسر بسرعة عند تزامن موجة الحر مع عجز الري.
          </span>
        </div>
      )}
    </div>
  );
}
