"use client";

import { Button, ButtonGroup, Chip, Slider } from "@heroui/react";
import { CROPS_MATRIX, PREVIOUS_CROPS, PreviousCropId } from "@/data/cropsMatrix";
import { CloudSun, Droplet, Flame, Sprout, Sun, Zap } from "lucide-react";

interface StressSlidersProps {
  prevCropId?: PreviousCropId;
  heatStressC: number;
  waterDeficitPct: number;
  onPrevCropChange?: (cropId: PreviousCropId) => void;
  onHeatStressChange: (val: number) => void;
  onWaterDeficitChange: (val: number) => void;
  showPrevCrop?: boolean;
}

const STRESS_PRESETS = [
  {
    id: "mild",
    labelAr: "جو معتدل",
    heat: 0,
    water: 0,
    Icon: CloudSun,
  },
  {
    id: "moderate",
    labelAr: "موجة حر متوسطة",
    heat: 2.0,
    water: 20,
    Icon: Sun,
  },
  {
    id: "extreme",
    labelAr: "حر شديد ونقص ري",
    heat: 3.5,
    water: 35,
    Icon: Zap,
  },
] as const;

export function StressSliders({
  prevCropId = "wheat",
  heatStressC,
  waterDeficitPct,
  onPrevCropChange,
  onHeatStressChange,
  onWaterDeficitChange,
  showPrevCrop = true,
}: StressSlidersProps) {
  const activeFamilyAr = CROPS_MATRIX[prevCropId]?.familyAr ?? "";

  return (
    <div className="flex flex-col gap-3">
      {showPrevCrop && onPrevCropChange && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2 text-xs text-slate-800 dark:text-slate-200">
            <span className="flex items-center gap-1.5 font-semibold">
              <Sprout className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              ما هو المحصول المزروع حالياً أو سابقاً؟
            </span>
            <Chip
              size="sm"
              variant="flat"
              color="default"
              className="h-5 text-[11px] bg-slate-200 text-slate-800 dark:bg-slate-800/80 dark:text-slate-300"
            >
              العائلة {activeFamilyAr}
            </Chip>
          </div>

          <ButtonGroup fullWidth size="sm" variant="bordered">
            {PREVIOUS_CROPS.map((crop) => {
              const active = prevCropId === crop.id;
              return (
                <Button
                  key={crop.id}
                  aria-pressed={active}
                  onPress={() => onPrevCropChange(crop.id)}
                  className={
                    active
                      ? "bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/60 font-bold"
                      : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100 dark:bg-[#090f1b] dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800/70"
                  }
                >
                  {crop.labelAr}
                </Button>
              );
            })}
          </ButtonGroup>
        </div>
      )}

      <div className="hud-subpanel rounded-lg p-3.5 flex flex-col gap-3.5">
        <div className="flex flex-wrap items-center justify-between gap-1.5 pb-2 border-b border-slate-200 dark:border-slate-800/80">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            تجربة سريعة للظروف:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {STRESS_PRESETS.map(({ id, labelAr, heat, water, Icon }) => {
              const isPresetActive =
                heatStressC === heat && waterDeficitPct === water;
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={isPresetActive}
                  onClick={() => {
                    onHeatStressChange(heat);
                    onWaterDeficitChange(water);
                  }}
                  className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                    isPresetActive
                      ? "bg-amber-500/20 text-amber-800 border-amber-500/60 dark:text-amber-200 dark:border-amber-400/60"
                      : "bg-white text-slate-700 border-slate-300 hover:border-slate-400 dark:bg-[#0d1421] dark:text-slate-300 dark:border-slate-800 dark:hover:border-slate-600"
                  }`}
                >
                  <Icon className="h-3 w-3 shrink-0" />
                  <span>{labelAr}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-amber-700 dark:text-amber-300">
              <Flame className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              موجة حر إضافية (+0°C إلى +4.5°C)
            </span>
            <span className="font-bold text-amber-700 dark:text-amber-300 tabular-telemetry">
              +{heatStressC.toFixed(1)} °C
            </span>
          </div>
          <Slider
            aria-label="موجة حر إضافية"
            size="sm"
            color="warning"
            maxValue={4.5}
            minValue={0}
            step={0.5}
            value={heatStressC}
            onChange={(val) =>
              onHeatStressChange(Array.isArray(val) ? val[0] : val)
            }
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-rose-700 dark:text-rose-300">
              <Droplet className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              نقص مياه الري (0% إلى -45%)
            </span>
            <span className="font-bold text-rose-700 dark:text-rose-300 tabular-telemetry">
              -{waterDeficitPct}%
            </span>
          </div>
          <Slider
            aria-label="نقص مياه الري"
            size="sm"
            color="danger"
            maxValue={45}
            minValue={0}
            step={5}
            value={waterDeficitPct}
            onChange={(val) =>
              onWaterDeficitChange(Array.isArray(val) ? val[0] : val)
            }
          />
        </div>
      </div>
    </div>
  );
}
