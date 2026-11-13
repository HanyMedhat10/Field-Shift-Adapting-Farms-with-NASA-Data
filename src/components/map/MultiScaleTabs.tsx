"use client";

import { Chip, Tab, Tabs } from "@heroui/react";
import { MultiScaleTelemetry } from "@/data/nasaFallback";
import { Droplets, Leaf, Radar, ThermometerSun } from "lucide-react";

interface MultiScaleTabsProps {
  telemetry: MultiScaleTelemetry;
}

export function MultiScaleTabs({ telemetry }: MultiScaleTabsProps) {
  return (
    <div className="flex flex-col gap-2">
      <Tabs
        aria-label="قراءات الأقمار الصناعية من ناسا"
        variant="underlined"
        color="success"
        size="sm"
        fullWidth
        classNames={{
          tabList: "border-b border-slate-200 dark:border-slate-800 gap-1",
          tab: "px-2 py-2 text-xs font-semibold",
          cursor: "bg-emerald-500 dark:bg-emerald-400",
          panel: "pt-2.5 pb-0 px-0",
        }}
      >
        <Tab
          key="smap"
          title={
            <div className="flex items-center gap-1">
              <Droplets className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
              <span>رطوبة التربة</span>
            </div>
          }
        >
          <div className="hud-subpanel rounded-lg p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {telemetry.smap.labelAr}
              </span>
              <Chip size="sm" variant="flat" color="primary" className="tabular-telemetry">
                {telemetry.smap.rootMoisturePct}% رطوبة الجذور
              </Chip>
            </div>
            <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {telemetry.smap.statusAr}
            </div>
          </div>
        </Tab>

        <Tab
          key="modis"
          title={
            <div className="flex items-center gap-1">
              <Leaf className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>صحة النبات</span>
            </div>
          }
        >
          <div className="hud-subpanel rounded-lg p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {telemetry.modis.labelAr}
              </span>
              <Chip size="sm" variant="flat" color="success" className="tabular-telemetry">
                مؤشر الخضرة {telemetry.modis.ndviValue}
              </Chip>
            </div>
            <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {telemetry.modis.canopyStatusAr} — {telemetry.modis.previousStressAr}
            </div>
          </div>
        </Tab>

        <Tab
          key="power"
          title={
            <div className="flex items-center gap-1">
              <ThermometerSun className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span>مناخ 10 سنوات</span>
            </div>
          }
        >
          <div className="hud-subpanel rounded-lg p-3 flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {telemetry.power.labelAr}
              </span>
              <Chip size="sm" variant="flat" color="warning" className="tabular-telemetry">
                +{telemetry.power.thermalAnomalyC}°C ارتفاع
              </Chip>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="hud-inset rounded-md p-2">
                <div className="text-[11px] text-slate-600 dark:text-slate-400">
                  متوسط الحرارة
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 tabular-telemetry">
                  {telemetry.power.meanT2mC}°C
                </div>
              </div>
              <div className="hud-inset rounded-md p-2">
                <div className="text-[11px] text-slate-600 dark:text-slate-400">
                  سطوع الشمس
                </div>
                <div className="text-sm font-bold text-sky-700 dark:text-sky-300 tabular-telemetry">
                  {telemetry.power.solarRadiation} kWh
                </div>
              </div>
              <div className="hud-inset rounded-md p-2">
                <div className="text-[11px] text-slate-600 dark:text-slate-400">
                  سنوات الحر
                </div>
                <div className="text-sm font-bold text-amber-700 dark:text-amber-300 tabular-telemetry">
                  {telemetry.power.heatWaveYearsCount} / 10
                </div>
              </div>
            </div>
          </div>
        </Tab>

        <Tab
          key="asf"
          title={
            <div className="flex items-center gap-1">
              <Radar className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>رادار الأرض</span>
            </div>
          }
        >
          <div className="hud-subpanel rounded-lg p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {telemetry.asf.labelAr}
              </span>
              <Chip size="sm" variant="flat" color="secondary" className="tabular-telemetry">
                {telemetry.asf.polarization}
              </Chip>
            </div>
            <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {telemetry.asf.cloudPenetrationStatusAr} — {telemetry.asf.surfaceMoistureHintAr}
            </div>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
