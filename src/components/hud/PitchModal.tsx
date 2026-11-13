"use client";

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
    title: "1. المشكلة: توصية المحصول الواحد",
    body: "ترشيح محصول واحد مربح دون النظر لـ 3 مواسم متتالية يستنزف النيتروجين، يكرر العائلة النباتية، ويدمر دخل المزارع عند أول موجة حر أو عجز ري.",
  },
  {
    title: "2. الحل: قمرة قرار OrbitAgri",
    body: "دمج 4 مقاييس رصد من ناسا (POWER 10 سنوات، MODIS NDVI، SMAP GWETROOT، رادار Sentinel-1) لمقارنة 3 مسارات زراعية في شاشة واحدة.",
  },
  {
    title: "3. كشف المفاضلات وعدم اليقين",
    body: "مخطط الرادار الخماسي يظهر تضحيات كل مسار، وأشرطة P10/P50/P90 تحدد أسوأ وأفضل سنة مناخية بناءً على بيانات 2015–2024.",
  },
  {
    title: "4. المعمارية والمرونة الميدانية",
    body: "تطبيق Next.js Full-Stack موحد مع تخزين مؤقت 24 ساعة وخطة طوارئ محلية فورية + مستشار Gemini بالعامية المصرية.",
  },
  {
    title: "5. الأثر القابل للقياس",
    body: "توفير 3–10 شكاير يوريا/فدان، خفض استهلاك المياه حتى 35%، وحماية دخل أسوأ سنة مناخية P10 في الدلتا والصعيد والوادي الجديد.",
  },
];

const DEMO_TIMELINE = [
  {
    time: "00:00 – 00:15",
    step: "استعراض الخريطة الفضائية وطبقة NASA GIBS MODIS NDVI وتبويبات POWER وSMAP وSentinel-1.",
  },
  {
    time: "00:15 – 00:30",
    step: "اختيار الغربية والمحصول السابق (بطاطس)، ثم تفعيل سيناريو (ذروة الحر والجفاف +3.5°C / -35%).",
  },
  {
    time: "00:30 – 00:45",
    step: "مقارنة انهيار المسار النقدي وتعارض العائلة الباذنجانية في شبكة 3×3 مقابل صمود المسار المتوازن.",
  },
  {
    time: "00:45 – 01:00",
    step: "قراءة نطاق P10/P50/P90 وملخص العامية المصرية وفتح نافذة فحص بيانات ناسا JSON لإثبات المصداقية.",
  },
];

export function PitchModal({ isOpen, onOpenChange }: PitchModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="3xl"
      scrollBehavior="inside"
      classNames={{
        base: "bg-[#0b1220] border border-slate-700 text-slate-100",
        header: "border-b border-slate-800",
        footer: "border-t border-slate-800",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Presentation className="h-5 w-5 text-emerald-400" />
                <h2 className="text-lg font-bold">
                  عرض التحكيم (5 شرائح + ديمو 60 ثانية)
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
                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-300">
                  <Layers className="h-4 w-4" />
                  <span>هيكل العرض التقديمي (5 Slides)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {PITCH_SLIDES.map((slide) => (
                    <div
                      key={slide.title}
                      className="hud-subpanel rounded-lg p-3 flex flex-col gap-1"
                    >
                      <div className="text-xs font-bold text-emerald-300">
                        {slide.title}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {slide.body}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                  <Clock className="h-4 w-4" />
                  <span>سيناريو الديمو الحي أمام لجنة التحكيم (60 ثانية)</span>
                </div>
                <div className="flex flex-col gap-2">
                  {DEMO_TIMELINE.map((item) => (
                    <div
                      key={item.time}
                      className="hud-subpanel rounded-lg px-3 py-2 flex items-center justify-between gap-3 text-xs"
                    >
                      <span className="text-slate-200 leading-relaxed">
                        {item.step}
                      </span>
                      <Chip
                        size="sm"
                        variant="bordered"
                        className="border-amber-500/40 text-amber-300 shrink-0 tabular-telemetry"
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
                العودة لقمرة التحكم
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

