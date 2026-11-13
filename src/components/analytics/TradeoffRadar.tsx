"use client";

import { useTheme } from "@/app/providers";
import {
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  PointElement,
  RadialLinearScale,
  Tooltip,
} from "chart.js";
import { PathwaySimulationResult } from "@/lib/simulationEngine";
import { Radar } from "react-chartjs-2";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface TradeoffRadarProps {
  selectedPathway: PathwaySimulationResult;
  cashPathway: PathwaySimulationResult;
}

export function TradeoffRadar({
  selectedPathway,
  cashPathway,
}: TradeoffRadarProps) {
  const { isDark } = useTheme();
  const isCashSelected = selectedPathway.id === "cash";

  const selectedFill =
    selectedPathway.id === "resilient"
      ? "rgba(14, 165, 233, 0.22)"
      : selectedPathway.id === "cash"
      ? "rgba(244, 63, 94, 0.22)"
      : "rgba(16, 185, 129, 0.24)";

  const selectedStroke =
    selectedPathway.id === "resilient"
      ? "#0284c7"
      : selectedPathway.id === "cash"
      ? "#e11d48"
      : "#10b981";

  const datasets = [
    {
      label: selectedPathway.titleAr,
      data: [
        selectedPathway.radar.cashReturn,
        selectedPathway.radar.waterSaving,
        selectedPathway.radar.nitrogenCharge,
        selectedPathway.radar.heatResilience,
        selectedPathway.radar.pestBreak,
      ],
      backgroundColor: selectedFill,
      borderColor: selectedStroke,
      borderWidth: 2,
      pointBackgroundColor: selectedStroke,
      pointBorderColor: isDark ? "#070b12" : "#ffffff",
      pointRadius: 3.5,
    },
  ];

  if (!isCashSelected) {
    datasets.push({
      label: cashPathway.titleAr,
      data: [
        cashPathway.radar.cashReturn,
        cashPathway.radar.waterSaving,
        cashPathway.radar.nitrogenCharge,
        cashPathway.radar.heatResilience,
        cashPathway.radar.pestBreak,
      ],
      backgroundColor: "rgba(244, 63, 94, 0.14)",
      borderColor: "#f43f5e",
      borderWidth: 1.5,
      pointBackgroundColor: "#f43f5e",
      pointBorderColor: isDark ? "#070b12" : "#ffffff",
      pointRadius: 2.5,
    });
  }

  const axisItems = [
    { label: "الربح المادي", value: selectedPathway.radar.cashReturn },
    { label: "توفير المياه", value: selectedPathway.radar.waterSaving },
    { label: "خصوبة التربة", value: selectedPathway.radar.nitrogenCharge },
    { label: "تحمل الحر", value: selectedPathway.radar.heatResilience },
    { label: "مقاومة الآفات", value: selectedPathway.radar.pestBreak },
  ];

  return (
    <div className="hud-subpanel rounded-lg p-3 flex flex-col gap-2.5">
      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
        مقارنة المكاسب والتضحيات (أمام المسار النقدي)
      </div>

      <div className="h-[225px] w-full">
        <Radar
          data={{
            labels: [
              "الربح المادي",
              "توفير المياه",
              "خصوبة التربة",
              "تحمل الحر",
              "مقاومة الآفات",
            ],
            datasets,
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              r: {
                min: 0,
                max: 100,
                ticks: {
                  stepSize: 25,
                  display: false,
                },
                grid: {
                  color: isDark
                    ? "rgba(148, 163, 184, 0.16)"
                    : "rgba(15, 23, 42, 0.12)",
                },
                angleLines: {
                  color: isDark
                    ? "rgba(148, 163, 184, 0.18)"
                    : "rgba(15, 23, 42, 0.14)",
                },
                pointLabels: {
                  color: isDark ? "#cbd5e1" : "#1e293b",
                  font: {
                    family: "Cairo, system-ui, sans-serif",
                    size: 11,
                    weight: 600,
                  },
                },
              },
            },
            plugins: {
              legend: {
                position: "bottom",
                labels: {
                  color: isDark ? "#e2e8f0" : "#0f172a",
                  boxWidth: 10,
                  padding: 8,
                  font: {
                    family: "Cairo, system-ui, sans-serif",
                    size: 11,
                  },
                },
              },
            },
          }}
        />
      </div>

      <div className="grid grid-cols-5 gap-1.5 pt-2 border-t border-slate-200 dark:border-slate-800/80 text-center">
        {axisItems.map((axis) => (
          <div key={axis.label} className="hud-inset rounded-md py-1.5 px-1">
            <div className="text-[10px] text-slate-600 dark:text-slate-400 truncate">
              {axis.label}
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100 tabular-telemetry">
              {axis.value}/100
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
