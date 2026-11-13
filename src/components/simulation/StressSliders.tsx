"use client";

import { Button, ButtonGroup, Chip, Slider } from "@heroui/react";
import { CROPS_MATRIX, PREVIOUS_CROPS, PreviousCropId } from "@/data/cropsMatrix";
import { CloudSun, Droplet, Flame, History, Sun, Zap } from "lucide-react";

interface StressSlidersProps {
  prevCropId: PreviousCropId;
  heatStressC: number;
  waterDeficitPct: number;
  onPrevCropChange: (cropId: PreviousCropId) => void;
  onHeatStressChange: (val: number) => void;
  onWaterDeficitChange: (val: number) => void;
}

const STRESS_PRESETS = [
  {
    id: "mild",
    labelAr: "مناخ معتدل",
    heat: 0,
    water: 0,
    Icon: CloudSun,
  },
  {
    id: "moderate",
    labelAr: "صدمة متوسطة",
    heat: 2.0,
    water: 20,
    Icon: Sun,
  },
  {
    id: "extreme",
    labelAr: "ذروة الحر والجفاف",
    heat: 3.5,
    water: 35,
    Icon: Zap,
  },
] as const;

export function StressSliders({
  prevCropId,
  heatStressC,
  waterDeficitPct,
  onPrevCropChange,
  onHeatStressChange,
  onWaterDeficitChange,
}: StressSlidersProps) {
  const activeFamilyAr = CROPS_MATRIX[prevCropId]?.familyAr ?? "";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2 text-xs text-slate-300">
          <span className="flex items-center gap-1.5 font-semibold">
            <History className="h-3.5 w-3.5 text-emerald-400" />
            المحصول السابق في الأرض
          </span>
          <Chip
            size="sm"
            variant="flat"
            color="default"
            className="h-5 text-[11px] bg-slate-800/80 text-slate-300"
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
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/60 font-bold"
                    : "bg-[#090f1b] text-slate-300 border-slate-800 hover:bg-slate-800/70"
                }
              >
                {crop.labelAr}
              </Button>
            );
          })}
        </ButtonGroup>
      </div>

      <div className="hud-subpanel rounded-lg p-3 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-1.5 pb-2 border-b border-slate-800/80">
          <span className="text-[11px] font-semibold text-slate-400">
            سيناريوهات سريعة للتحكيم:
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
                  className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold transition-colors ${
                    isPresetActive
                      ? "bg-amber-500/20 text-amber-200 border-amber-400/60"
                      : "bg-[#0d1421] text-slate-300 border-slate-800 hover:border-slate-600"
                  }`}
                >
                  <Icon className="h-3 w-3 shrink-0" />
                  <span>{labelAr}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-amber-300">
              <Flame className="h-3.5 w-3.5 text-amber-400" />
              موجة حر إضافية
            </span>
            <span className="font-bold text-amber-300 tabular-telemetry">
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

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-rose-300">
              <Droplet className="h-3.5 w-3.5 text-rose-400" />
              عجز مياه الري
            </span>
            <span className="font-bold text-rose-300 tabular-telemetry">
              -{waterDeficitPct}%
            </span>
          </div>
          <Slider
            aria-label="عجز مياه الري"
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
