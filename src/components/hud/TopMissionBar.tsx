"use client";

import {
  Button,
  Chip,
  Navbar,
  NavbarBrand,
  NavbarContent,
} from "@heroui/react";
import {
  Database,
  Droplets,
  MapPin,
  PackageCheck,
  Presentation,
  Satellite,
  ThermometerSun,
} from "lucide-react";

interface TopMissionBarProps {
  governorateNameAr: string;
  coordinates: { lat: number; lon: number };
  thermalAnomalyC: number;
  rootMoisturePct: number;
  ureaSacksSaved: number;
  waterSavedPct: number;
  isLiveNasa: boolean;
  onOpenRawJson: () => void;
  onOpenPitchModal: () => void;
}

export function TopMissionBar({
  governorateNameAr,
  coordinates,
  thermalAnomalyC,
  rootMoisturePct,
  ureaSacksSaved,
  waterSavedPct,
  isLiveNasa,
  onOpenRawJson,
  onOpenPitchModal,
}: TopMissionBarProps) {
  return (
    <Navbar
      maxWidth="full"
      isBordered
      className="bg-[#090f1a]/95 border-slate-800/90 px-2 lg:px-6 h-auto py-2.5"
      classNames={{
        wrapper: "px-2 gap-3 flex-wrap justify-between min-h-[56px] max-w-[1440px] mx-auto",
      }}
    >
      <NavbarBrand className="gap-3 grow-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 shrink-0">
          <Satellite className="h-5 w-5" />
        </div>
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold tracking-tight text-slate-50">
              OrbitAgri — مستشار الدورة الزراعية
            </span>
            <Chip
              size="sm"
              variant="flat"
              color={isLiveNasa ? "success" : "warning"}
              className="h-5 text-[11px]"
            >
              {isLiveNasa ? "ناسا متصلة" : "بيانات دلتا النيل"}
            </Chip>
          </div>
          <span className="flex items-center gap-1 text-xs text-slate-400 tabular-telemetry">
            <MapPin className="h-3 w-3 text-emerald-400" />
            {governorateNameAr} ({coordinates.lat.toFixed(2)}°N, {coordinates.lon.toFixed(2)}°E)
          </span>
        </div>
      </NavbarBrand>

      <NavbarContent justify="center" className="gap-2 flex-wrap">
        <Chip
          variant="flat"
          color="warning"
          startContent={<ThermometerSun className="h-3.5 w-3.5" />}
          className="font-semibold tabular-telemetry"
        >
          تغيّر حرارة ناسا (10 سنوات): {thermalAnomalyC >= 0 ? `+${thermalAnomalyC}` : thermalAnomalyC}°C
        </Chip>

        <Chip
          variant="flat"
          color="primary"
          startContent={<Droplets className="h-3.5 w-3.5" />}
          className="font-semibold tabular-telemetry"
        >
          رطوبة التربة (SMAP): {rootMoisturePct}%
        </Chip>

        <Chip
          variant="flat"
          color="success"
          startContent={<PackageCheck className="h-3.5 w-3.5" />}
          className="font-semibold tabular-telemetry"
        >
          توفير {ureaSacksSaved} شكارة يوريا | {waterSavedPct}% ماء
        </Chip>
      </NavbarContent>

      <NavbarContent justify="end" className="gap-2 flex-wrap grow-0">
        <Button
          size="sm"
          variant="bordered"
          color="default"
          onPress={onOpenPitchModal}
          startContent={<Presentation className="h-3.5 w-3.5 text-emerald-400" />}
          className="border-slate-700 bg-slate-900/70 text-slate-100 hover:border-emerald-500/60 font-medium"
        >
          ملخص التحكيم
        </Button>

        <Button
          size="sm"
          variant="bordered"
          color="default"
          onPress={onOpenRawJson}
          startContent={<Database className="h-3.5 w-3.5 text-sky-400" />}
          className="border-slate-700 bg-slate-900/70 text-slate-100 hover:border-sky-500/60 font-medium"
        >
          عرض بيانات ناسا الخام (JSON)
        </Button>
      </NavbarContent>
    </Navbar>
  );
}
