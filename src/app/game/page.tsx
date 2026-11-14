"use client";

import { useLanguage, useTheme } from "@/app/providers";
import { Button, Chip } from "@heroui/react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ExternalLink,
  Gamepad2,
  Globe,
  Maximize2,
  Minimize2,
  Moon,
  RotateCcw,
  Sun,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function GodotGamePage() {
  const { isDark, toggleTheme } = useTheme();
  const { isAr, toggleLanguage } = useLanguage();

  const [iframeKey, setIframeKey] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const handleToggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await containerRef.current?.requestFullscreen();
      }
    } catch {
      // Ignore fullscreen rejection if blocked by browser policy
    }
  };

  const handleRestartGame = () => {
    setIframeKey((prev) => prev + 1);
  };

  const handleIframeLoad = () => {
    try {
      iframeRef.current?.focus();
      iframeRef.current?.contentWindow?.focus();
    } catch {
      // Ignore focus errors
    }
  };

  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-ground)] text-[var(--text-main)] transition-colors duration-200">
      <header className="sticky top-0 z-40 w-full border-b border-[var(--border-panel)] bg-[var(--bg-nav)] backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 shrink-0">
              <Gamepad2 className="h-5 w-5" />
            </div>
            <div className="flex flex-col leading-tight min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
                  {isAr
                    ? "لعبة المزرعة السعيدة — ElMazra3a EL sa3ida"
                    : "ElMazra3a EL sa3ida — Interactive Farm Game"}
                </h1>
                <Chip
                  size="sm"
                  variant="flat"
                  color="success"
                  className="h-5 text-[11px]"
                >
                  Godot HTML5 WebGL2
                </Chip>
              </div>
              <span className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
                {isAr
                  ? "النسخة التفاعلية المباشرة على المتصفح — اضغط داخل اللعبة للتحكم الكامل"
                  : "Live browser-hosted simulation — click inside the game canvas for keyboard and mouse controls"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              as={Link}
              href="/"
              size="sm"
              color="success"
              variant="flat"
              startContent={<BackArrow className="h-3.5 w-3.5" />}
              className="font-bold"
            >
              {isAr ? "العودة لقمرة القرار" : "Back to Decision Cockpit"}
            </Button>

            <Button
              as={Link}
              href="/blog"
              size="sm"
              variant="bordered"
              color="default"
              startContent={
                <BookOpen className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              }
              className="border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/70 text-slate-800 dark:text-slate-100 hover:border-emerald-500/60 font-semibold"
            >
              {isAr ? "مدونة تحليل المناطق" : "Regional Data Blog"}
            </Button>

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
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1440px] flex-1 p-4 lg:p-6 flex flex-col gap-4">
        <section
          ref={containerRef}
          aria-label={
            isAr
              ? "نافذة تشغيل لعبة المزرعة السعيدة"
              : "ElMazra3a EL sa3ida Game Viewport"
          }
          className="hud-panel rounded-2xl overflow-hidden flex flex-col bg-black"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-[var(--border-panel)] bg-[var(--bg-panel)]">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              <span>
                {isAr
                  ? "بيئة تشغيل Godot 4 — محمّلة محلياً على الموقع"
                  : "Godot 4 Runtime — Served directly from site assets"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="bordered"
                color="default"
                onPress={handleRestartGame}
                startContent={<RotateCcw className="h-3.5 w-3.5" />}
                className="border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/70 text-slate-800 dark:text-slate-100 font-medium"
              >
                {isAr ? "إعادة تشغيل" : "Restart Game"}
              </Button>

              <Button
                size="sm"
                variant="bordered"
                color="default"
                onPress={handleToggleFullscreen}
                startContent={
                  isFullscreen ? (
                    <Minimize2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Maximize2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  )
                }
                className="border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/70 text-slate-800 dark:text-slate-100 font-medium"
              >
                {isFullscreen
                  ? isAr
                    ? "إنهاء ملء الشاشة"
                    : "Exit Fullscreen"
                  : isAr
                  ? "ملء الشاشة"
                  : "Fullscreen"}
              </Button>

              <Button
                as="a"
                href="/godot-game/index.html"
                target="_blank"
                rel="noopener noreferrer"
                size="sm"
                variant="flat"
                color="success"
                startContent={<ExternalLink className="h-3.5 w-3.5" />}
                className="font-semibold"
              >
                {isAr ? "فتح في نافذة مستقلة" : "Open in Full Tab"}
              </Button>
            </div>
          </div>

          <iframe
            ref={iframeRef}
            key={iframeKey}
            src="/godot-game/index.html"
            title="ElMazra3a EL sa3ida Godot Game"
            allow="autoplay; fullscreen; gamepad; clipboard-read; clipboard-write"
            allowFullScreen
            onLoad={handleIframeLoad}
            className={`w-full border-0 bg-black ${
              isFullscreen
                ? "flex-1 h-full min-h-0"
                : "h-[calc(100vh-190px)] min-h-[540px]"
            }`}
          />
        </section>
      </main>
    </div>
  );
}
