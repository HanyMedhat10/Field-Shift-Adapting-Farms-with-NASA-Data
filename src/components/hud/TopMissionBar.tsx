"use client";

import {
  Button,
  Chip,
  Navbar,
  NavbarBrand,
  NavbarContent,
  Progress,
} from "@heroui/react";
import {
  Database,
  Droplets,
  PackageCheck,
  Presentation,
  Radio,
  Satellite,
  Sprout,
} from "lucide-react";

interface TopMissionBarProps {
  soilHealthScore: number;
  colorTheme: "success" | "danger" | "primary";
  ureaSacksSaved: number;
  waterSavedPct: number;
  governorateNameAr: string;
  coordinates: { lat: number; lon: number };
  isLiveNasa: boolean;
  onOpenRawJson: () => void;
  onOpenPitchModal: () => void;
}

export function TopMissionBar({
  soilHealthScore,
  colorTheme,
  ureaSacksSaved,
  waterSavedPct,
  governorateNameAr,
  coordinates,
  isLiveNasa,
  onOpenRawJson,
  onOpenPitchModal,
}: TopMissionBarProps) {
  return (
    <Navbar
      maxWidth="full"
      isBordered
      className="bg-[#090f1a]/95 border-slate-800/90 px-2 lg:px-4 h-auto py-2"
      classNames={{
        wrapper: "px-2 gap-3 flex-wrap justify-between min-h-[56px]",
      }}
    >
      <NavbarBrand className="gap-3 grow-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 shrink-0">
          <Satellite className="h-5 w-5" />
        </div>
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold tracking-tight text-slate-50">
              OrbitAgri
            </span>
            <Chip
              size="sm"
              variant="flat"
              color={isLiveNasa ? "success" : "warning"}
              startContent={<Radio className="h-3 w-3" />}
              className="h-5 text-[11px]"
            >
              {isLiveNasa ? "NASA Live" : "Offline Cache"}
            </Chip>
          </div>
          <span className="text-xs text-slate-400 tabular-telemetry">
            {governorateNameAr} ({coordinates.lat.toFixed(2)}°N, {coordinates.lon.toFixed(2)}°E)
          </span>
        </div>
      </NavbarBrand>

      <NavbarContent justify="center" className="flex-1 max-w-md min-w-[210px]">
        <div className="w-full flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <Sprout className="h-3.5 w-3.5 text-emerald-400" />
              مؤشر صحة التربة التراكمي
            </span>
            <span className="font-bold text-slate-100 tabular-telemetry">
              {soilHealthScore}%
            </span>
          </div>
          <Progress
            aria-label="مؤشر صحة التربة"
            size="sm"
            value={soilHealthScore}
            color={colorTheme}
            className="w-full"
          />
        </div>
      </NavbarContent>

      <NavbarContent justify="end" className="gap-2 flex-wrap grow-0">
        <Chip
          variant="flat"
          color="success"
          startContent={<PackageCheck className="h-3.5 w-3.5" />}
          className="font-semibold tabular-telemetry"
        >
          توفير {ureaSacksSaved} شكارة يوريا
        </Chip>

        <Chip
          variant="flat"
          color="primary"
          startContent={<Droplets className="h-3.5 w-3.5" />}
          className="font-semibold tabular-telemetry"
        >
          توفير {waterSavedPct}% مياه ري
        </Chip>

        <Button
          size="sm"
          variant="bordered"
          color="default"
          onPress={onOpenPitchModal}
          startContent={<Presentation className="h-3.5 w-3.5 text-emerald-400" />}
          className="border-slate-700 bg-slate-900/70 text-slate-100 hover:border-emerald-500/60 font-medium"
        >
          عرض التحكيم 60s
        </Button>

        <Button
          size="sm"
          variant="bordered"
          color="default"
          onPress={onOpenRawJson}
          startContent={<Database className="h-3.5 w-3.5 text-sky-400" />}
          className="border-slate-700 bg-slate-900/70 text-slate-100 hover:border-sky-500/60 font-medium"
        >
          فحص بيانات ناسا JSON
        </Button>
      </NavbarContent>
    </Navbar>
  );
}

