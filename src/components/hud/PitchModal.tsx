"use client";

import { useLanguage } from "@/app/providers";
import {
  Button,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { Clock, Layers, Presentation, Sparkles } from "lucide-react";

interface PitchModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const PITCH_SLIDES = [
  {
    titleAr: "1. المشكلة: توصية المحصول الواحد",
    titleEn: "1. Problem: Static Single-Crop Advice",
    bodyAr:
      "ترشيح محصول واحد مربح دون النظر لـ 3 مواسم متتالية يستنزف النيتروجين، يكرر العائلة النباتية، ويدمر دخل المزارع عند أول موجة حر أو عجز ري.",
    bodyEn:
      "Recommending a single cash crop without planning 3 consecutive seasons depletes nitrogen, repeats botanical families, and exposes farmers to severe losses during heatwaves or water deficits.",
  },
  {
    titleAr: "2. الحل: قمرة قرار ElMazra3a EL sa3ida",
    titleEn: "2. Solution: ElMazra3a EL sa3ida Decision Cockpit",
    bodyAr:
      "دمج 4 مقاييس رصد من ناسا (POWER 10 سنوات، MODIS NDVI، SMAP GWETROOT، رادار Sentinel-1) لمقارنة 3 مسارات زراعية في شاشة واحدة.",
    bodyEn:
      "Unifies 4 NASA observation scales (10-yr POWER climate, MODIS NDVI, SMAP GWETROOT, ASF Sentinel-1 SAR) to compare 3 multi-season rotation pathways on a single screen.",
  },
  {
    titleAr: "3. كشف المفاضلات وعدم اليقين",
    titleEn: "3. Revealing Tradeoffs & Climate Uncertainty",
    bodyAr:
      "مخطط الرادار الخماسي يظهر تضحيات كل مسار، وأشرطة P10/P50/P90 تحدد أسوأ وأفضل سنة مناخية بناءً على بيانات 2015–2024.",
    bodyEn:
      "A 5-axis Radar chart reveals every pathway's agronomic tradeoffs, while P10/P50/P90 risk bands quantify worst-case vs. best-case income across 2015–2024.",
  },
  {
    titleAr: "4. المعمارية والمرونة الميدانية",
    titleEn: "4. Unified Architecture & Offline Resilience",
    bodyAr:
      "تطبيق Next.js Full-Stack موحد مع تخزين مؤقت 24 ساعة وخطة طوارئ محلية فورية + مستشار Gemini بالعامية المصرية.",
    bodyEn:
      "Unified Next.js Full-Stack app with 24-hour data caching, instant Nile Delta offline fallback, and an AI agronomy copilot powered by Gemini.",
  },
  {
    titleAr: "5. الأثر القابل للقياس",
    titleEn: "5. Measurable On-Farm Impact",
    bodyAr:
      "توفير 3–10 شكاير يوريا/فدان، خفض استهلاك المياه حتى 35%، وحماية دخل أسوأ سنة مناخية P10 في الدلتا والصعيد والوادي الجديد.",
    bodyEn:
      "Saves 3–10 urea sacks/feddan, cuts irrigation water usage by up to 35%, and shields worst-year (P10) farmer income across the Delta, Upper Egypt, and New Valley.",
  },
];

const DEMO_TIMELINE = [
  {
    time: "00:00 – 00:15",
    stepAr:
      "استعراض الخريطة الفضائية وطبقة NASA GIBS MODIS NDVI وتبويبات POWER وSMAP وSentinel-1.",
    stepEn:
      "Explore the satellite map, toggle NASA GIBS MODIS NDVI overlay, and inspect POWER, SMAP & Sentinel-1 tabs.",
  },
  {
    time: "00:15 – 00:30",
    stepAr:
      "اختيار الغربية والمحصول السابق (طماطم)، ثم تفعيل سيناريو (حر شديد ونقص ري +3.5°C / -35%).",
    stepEn:
      "Pick Gharbia & previous crop Tomato, then trigger the Extreme Drought preset (+3.5°C / -35% water).",
  },
  {
    time: "00:30 – 00:45",
    stepAr:
      "مقارنة انهيار المسار النقدي وخصم الـ 18% لتكرار العائلة الباذنجانية مقابل صمود المسار المتوازن.",
    stepEn:
      "Compare the Cash track collapse & -18% Solanaceae clash penalty against the Balanced pathway's resilience.",
  },
  {
    time: "00:45 – 01:00",
    stepAr:
      "قراءة نطاق P10/P50/P90 وتوصية المستشار الذكي وفتح نافذة عرض بيانات ناسا الخام JSON لإثبات المصداقية.",
    stepEn:
      "Inspect P10/P50/P90 uncertainty bands, AI Copilot guidance, and open the Raw NASA JSON modal for judges.",
  },
];

export function PitchModal({ isOpen, onOpenChange }: PitchModalProps) {
  const { isAr } = useLanguage();

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="3xl"
      scrollBehavior="inside"
      classNames={{
        base: "bg-white dark:bg-[#0b1220] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100",
        header: "border-b border-slate-200 dark:border-slate-800",
        footer: "border-t border-slate-200 dark:border-slate-800",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Presentation className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-lg font-bold">
                  {isAr
                    ? "عرض التحكيم (5 شرائح + ديمو 60 ثانية)"
                    : "Judge Pitch Deck (5 Slides + 60s Live Demo)"}
                </h2>
              </div>
              <Chip
                size="sm"
                variant="flat"
                color="success"
                startContent={<Sparkles className="h-3.5 w-3.5" />}
              >
                NASA Space Apps 2026
              </Chip>
            </ModalHeader>

            <ModalBody className="py-4 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-700 dark:text-sky-300">
                  <Layers className="h-4 w-4" />
                  <span>
                    {isAr
                      ? "هيكل العرض التقديمي (5 Slides)"
                      : "Presentation Outline (5 Slides)"}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {PITCH_SLIDES.map((slide) => (
                    <div
                      key={slide.titleEn}
                      className="hud-subpanel rounded-lg p-3 flex flex-col gap-1"
                    >
                      <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                        {isAr ? slide.titleAr : slide.titleEn}
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        {isAr ? slide.bodyAr : slide.bodyEn}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                  <Clock className="h-4 w-4" />
                  <span>
                    {isAr
                      ? "سيناريو الديمو الحي أمام لجنة التحكيم (60 ثانية)"
                      : "60-Second Live Judge Demo Script"}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {DEMO_TIMELINE.map((item) => (
                    <div
                      key={item.time}
                      className="hud-subpanel rounded-lg px-3 py-2 flex items-center justify-between gap-3 text-xs"
                    >
                      <span className="text-slate-800 dark:text-slate-200 leading-relaxed">
                        {isAr ? item.stepAr : item.stepEn}
                      </span>
                      <Chip
                        size="sm"
                        variant="bordered"
                        className="border-amber-500/40 text-amber-700 dark:text-amber-300 shrink-0 tabular-telemetry"
                        dir="ltr"
                      >
                        {item.time}
                      </Chip>
                    </div>
                  ))}
                </div>
              </div>
            </ModalBody>

            <ModalFooter>
              <Button size="sm" color="success" variant="flat" onPress={onClose}>
                {isAr ? "العودة لقمرة التحكم" : "Back to Decision Cockpit"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
