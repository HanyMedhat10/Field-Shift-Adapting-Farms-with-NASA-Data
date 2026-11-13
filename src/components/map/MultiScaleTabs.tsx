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
        aria-label="مقاييس رصد وكالة ناسا الأربعة"
        variant="underlined"
        color="success"
        size="sm"
        fullWidth
        classNames={{
          tabList: "border-b border-slate-800 gap-1",
          tab: "px-2 py-2 text-xs font-semibold",
          cursor: "bg-emerald-400",
          panel: "pt-2 pb-0 px-0",
        }}
      >
        <Tab
          key="power"
          title={
            <div className="flex items-center gap-1">
              <ThermometerSun className="h-3.5 w-3.5 text-amber-400" />
              <span>إقليمي POWER</span>
            </div>
          }
        >
          <div className="hud-subpanel rounded-lg p-3 flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">{telemetry.power.source}</span>
              <Chip size="sm" variant="flat" color="warning" className="tabular-telemetry">
                +{telemetry.power.thermalAnomalyC}°C شذوذ
              </Chip>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md bg-[#0d1421] border border-slate-800/80 p-2">
                <div className="text-[11px] text-slate-400">متوسط الحرارة</div>
                <div className="text-sm font-bold text-slate-100 tabular-telemetry">
                  {telemetry.power.meanT2mC}°C
                </div>
              </div>
              <div className="rounded-md bg-[#0d1421] border border-slate-800/80 p-2">
                <div className="text-[11px] text-slate-400">العظمى 10 سنين</div>
                <div className="text-sm font-bold text-amber-300 tabular-telemetry">
                  {telemetry.power.meanT2mMaxC}°C
                </div>
              </div>
              <div className="rounded-md bg-[#0d1421] border border-slate-800/80 p-2">
                <div className="text-[11px] text-slate-400">الإشعاع الشمسي</div>
                <div className="text-sm font-bold text-sky-300 tabular-telemetry">
                  {telemetry.power.solarRadiation} kWh
                </div>
              </div>
            </div>
            <div className="text-xs text-slate-300 flex items-center justify-between">
              <span>سنوات موجات الحر الشديدة (2015–2024):</span>
              <span className="font-bold text-amber-400 tabular-telemetry">
                {telemetry.power.heatWaveYearsCount} من 10 سنوات
              </span>
            </div>
          </div>
        </Tab>

        <Tab
          key="modis"
          title={
            <div className="flex items-center gap-1">
              <Leaf className="h-3.5 w-3.5 text-emerald-400" />
              <span>الحقل NDVI</span>
            </div>
          }
        >
          <div className="hud-subpanel rounded-lg p-3 flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">{telemetry.modis.product}</span>
              <Chip size="sm" variant="flat" color="success" className="tabular-telemetry">
                NDVI {telemetry.modis.ndviValue}
              </Chip>
            </div>
            <div className="flex items-center justify-between rounded-md bg-[#0d1421] border border-slate-800/80 px-3 py-2">
              <span className="text-xs text-slate-400">حالة الغطاء النباتي</span>
              <span className="text-xs font-bold text-emerald-300">
                {telemetry.modis.canopyStatusAr}
              </span>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed">
              تقييم المحصول السابق: {telemetry.modis.previousStressAr}
            </div>
          </div>
        </Tab>

        <Tab
          key="smap"
          title={
            <div className="flex items-center gap-1">
              <Droplets className="h-3.5 w-3.5 text-sky-400" />
              <span>الجذور SMAP</span>
            </div>
          }
        >
          <div className="hud-subpanel rounded-lg p-3 flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">{telemetry.smap.product}</span>
              <Chip size="sm" variant="flat" color="primary" className="tabular-telemetry">
                GWETROOT {telemetry.smap.gwetRoot}
              </Chip>
            </div>
            <div className="flex items-center justify-between rounded-md bg-[#0d1421] border border-slate-800/80 px-3 py-2">
              <span className="text-xs text-slate-400">نسبة تشبع منطقة الجذور</span>
              <span className="text-sm font-bold text-sky-300 tabular-telemetry">
                {telemetry.smap.rootMoisturePct}%
              </span>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed">
              {telemetry.smap.statusAr}
            </div>
          </div>
        </Tab>

        <Tab
          key="asf"
          title={
            <div className="flex items-center gap-1">
              <Radar className="h-3.5 w-3.5 text-cyan-400" />
              <span>رادار ASF</span>
            </div>
          }
        >
          <div className="hud-subpanel rounded-lg p-3 flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Sentinel-1 C-SAR</span>
              <Chip size="sm" variant="flat" color="secondary" className="tabular-telemetry">
                {telemetry.asf.polarization}
              </Chip>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="rounded-md bg-[#0d1421] border border-slate-800/80 p-2">
                <div className="text-[11px] text-slate-400">تشتت VV</div>
                <div className="text-sm font-bold text-cyan-300 tabular-telemetry">
                  {telemetry.asf.vvBackscatterDb} dB
                </div>
              </div>
              <div className="rounded-md bg-[#0d1421] border border-slate-800/80 p-2">
                <div className="text-[11px] text-slate-400">تشتت VH</div>
                <div className="text-sm font-bold text-cyan-200 tabular-telemetry">
                  {telemetry.asf.vhBackscatterDb} dB
                </div>
              </div>
            </div>
            <div className="text-[11px] text-slate-400 truncate" dir="ltr">
              {telemetry.asf.granuleName}
            </div>
            <div className="text-xs text-slate-300">
              {telemetry.asf.cloudPenetrationStatusAr} — {telemetry.asf.surfaceMoistureHintAr}
            </div>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}

