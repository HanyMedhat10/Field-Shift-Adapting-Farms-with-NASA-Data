"use client";

import { useLanguage, useTheme } from "@/app/providers";
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
  Globe,
  MapPin,
  Moon,
  PackageCheck,
  Presentation,
  Satellite,
  Sun,
  ThermometerSun,
} from "lucide-react";

interface TopMissionBarProps {
  governorateNameAr: string;
  governorateNameEn: string;
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
  governorateNameEn,
  coordinates,
  thermalAnomalyC,
  rootMoisturePct,
  ureaSacksSaved,
  waterSavedPct,
  isLiveNasa,
  onOpenRawJson,
  onOpenPitchModal,
}: TopMissionBarProps) {
  const { isDark, toggleTheme } = useTheme();
  const { isAr, toggleLanguage } = useLanguage();

  const govName = isAr ? governorateNameAr : governorateNameEn;

  return (
    <Navbar
      maxWidth="full"
      isBordered
      className="bg-[var(--bg-nav)] border-[var(--border-panel)] px-2 lg:px-6 h-auto py-2.5"
      classNames={{
        wrapper:
          "px-2 gap-3 flex-wrap justify-between min-h-[56px] max-w-[1440px] mx-auto",
      }}
    >
      <NavbarBrand className="gap-3 grow-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 shrink-0">
          <Satellite className="h-5 w-5" />
        </div>
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
              {isAr
                ? "ElMazra3a EL sa3ida — مستشار الدورة الزراعية"
                : "ElMazra3a EL sa3ida — Crop Rotation Advisor"}
            </span>
            <Chip
              size="sm"
              variant="flat"
              color={isLiveNasa ? "success" : "warning"}
              className="h-5 text-[11px]"
            >
              {isLiveNasa
                ? isAr
                  ? "ناسا متصلة"
                  : "NASA Live"
                : isAr
                ? "بيانات دلتا النيل"
                : "Nile Delta Cache"}
            </Chip>
          </div>
          <span className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 tabular-telemetry">
            <MapPin className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
            {govName} ({coordinates.lat.toFixed(2)}°N,{" "}
            {coordinates.lon.toFixed(2)}°E)
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
          {isAr
            ? "تغيّر حرارة ناسا (10 سنوات):"
            : "NASA 10-Yr Temp Anomaly:"}{" "}
          {thermalAnomalyC >= 0 ? `+${thermalAnomalyC}` : thermalAnomalyC}°C
        </Chip>

        <Chip
          variant="flat"
          color="primary"
          startContent={<Droplets className="h-3.5 w-3.5" />}
          className="font-semibold tabular-telemetry"
        >
          {isAr ? "رطوبة التربة (SMAP):" : "Soil Moisture (SMAP):"}{" "}
          {rootMoisturePct}%
        </Chip>

        <Chip
          variant="flat"
          color="success"
          startContent={<PackageCheck className="h-3.5 w-3.5" />}
          className="font-semibold tabular-telemetry"
        >
          {isAr
            ? `توفير ${ureaSacksSaved} شكارة يوريا | ${waterSavedPct}% ماء`
            : `Save ${ureaSacksSaved} Urea Sacks | ${waterSavedPct}% Water`}
        </Chip>
      </NavbarContent>

      <NavbarContent justify="end" className="gap-2 flex-wrap grow-0">
        <Button
          size="sm"
          variant="bordered"
          color="default"
          onPress={toggleLanguage}
          aria-label={isAr ? "Switch to English" : "التبديل إلى العربية"}
          startContent={
            <Globe className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          }
          className="border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/70 text-slate-800 dark:text-slate-100 hover:border-emerald-500/60 font-semibold"
        >
          {isAr ? "English" : "العربية"}
        </Button>

        <Button
          size="sm"
          variant="bordered"
          color="default"
          onPress={toggleTheme}
          aria-label={
            isDark
              ? isAr
                ? "التبديل إلى الوضع النهاري"
                : "Switch to Light Mode"
              : isAr
              ? "التبديل إلى الوضع الليلي"
              : "Switch to Dark Mode"
          }
          startContent={
            isDark ? (
              <Sun className="h-3.5 w-3.5 text-amber-400" />
            ) : (
              <Moon className="h-3.5 w-3.5 text-slate-700" />
            )
          }
          className="border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/70 text-slate-800 dark:text-slate-100 hover:border-amber-500/60 font-medium"
        >
          {isDark
            ? isAr
              ? "الوضع النهاري"
              : "Light Mode"
            : isAr
            ? "الوضع الليلي"
            : "Dark Mode"}
        </Button>

        <Button
          size="sm"
          variant="bordered"
          color="default"
          onPress={onOpenPitchModal}
          startContent={
            <Presentation className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          }
          className="border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/70 text-slate-800 dark:text-slate-100 hover:border-emerald-500/60 font-medium"
        >
          {isAr ? "ملخص التحكيم" : "Judge Pitch"}
        </Button>

        <Button
          size="sm"
          variant="bordered"
          color="default"
          onPress={onOpenRawJson}
          startContent={
            <Database className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
          }
          className="border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/70 text-slate-800 dark:text-slate-100 hover:border-sky-500/60 font-medium"
        >
          {isAr ? "عرض بيانات ناسا الخام (JSON)" : "Raw NASA JSON"}
        </Button>
      </NavbarContent>
    </Navbar>
  );
}
