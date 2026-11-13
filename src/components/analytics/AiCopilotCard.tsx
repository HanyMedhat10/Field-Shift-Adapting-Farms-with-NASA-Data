"use client";

import { Button, Chip, Skeleton } from "@heroui/react";
import { CopilotApiResponse } from "@/types/fieldShift";
import { Bot, CheckCircle2, RefreshCw } from "lucide-react";

interface AiCopilotCardProps {
  copilot: CopilotApiResponse | null;
  loading: boolean;
  onRefresh: () => void;
}

export function AiCopilotCard({
  copilot,
  loading,
  onRefresh,
}: AiCopilotCardProps) {
  return (
    <div className="hud-subpanel rounded-lg p-3.5 flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/15 border border-emerald-500/35 text-emerald-600 dark:text-emerald-400">
            <Bot className="h-4 w-4" />
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
            المستشار الزراعي الذكي (بالعامية المصرية)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {copilot && !loading && (
            <Chip
              size="sm"
              variant="flat"
              color={copilot.mode === "gemini-live" ? "success" : "primary"}
              className="h-5 text-[10px]"
            >
              {copilot.mode === "gemini-live" ? "Gemini AI" : "Smart Advisor"}
            </Chip>
          )}
          <Button
            isIconOnly
            size="sm"
            variant="light"
            aria-label="تحديث نصيحة المستشار الذكي"
            onPress={onRefresh}
            isDisabled={loading}
            className="h-7 w-7 min-w-7 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {loading || !copilot ? (
        <div className="flex flex-col gap-2 py-1">
          <Skeleton className="h-4 w-4/5 rounded-md bg-slate-200 dark:bg-slate-800" />
          <Skeleton className="h-3 w-full rounded-md bg-slate-200 dark:bg-slate-800" />
          <Skeleton className="h-3 w-11/12 rounded-md bg-slate-200 dark:bg-slate-800" />
          <Skeleton className="h-3 w-3/4 rounded-md bg-slate-200 dark:bg-slate-800" />
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-bold text-emerald-700 dark:text-emerald-300 leading-snug">
            {copilot.headlineAr}
          </h3>
          <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-200">
            {copilot.adviceAr}
          </p>
          <ul className="flex flex-col gap-1.5 pt-1.5 border-t border-slate-200 dark:border-slate-800/80">
            {copilot.actionChecklistAr.map((step, i) => (
              <li
                key={i}
                className="flex items-start gap-1.5 text-[11px] text-slate-700 dark:text-slate-300 leading-snug"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
