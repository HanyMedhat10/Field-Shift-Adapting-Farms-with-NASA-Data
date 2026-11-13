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
import { Check, Copy, Database, Satellite } from "lucide-react";
import { useState } from "react";

interface RawJsonModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  rawJson: unknown;
  sourceLabelAr: string;
  powerLive: boolean;
  asfLive: boolean;
}

export function RawJsonModal({
  isOpen,
  onOpenChange,
  rawJson,
  sourceLabelAr,
  powerLive,
  asfLive,
}: RawJsonModalProps) {
  const [copied, setCopied] = useState(false);

  const formatted = JSON.stringify(rawJson, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

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
            <ModalHeader className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-sky-400" />
                  <h2 className="text-lg font-bold">
                    مخرجات API ناسا الخام (NASA POWER & ASF Sentinel-1)
                  </h2>
                </div>
                <Chip
                  size="sm"
                  variant="flat"
                  color={powerLive || asfLive ? "success" : "warning"}
                  startContent={<Satellite className="h-3.5 w-3.5" />}
                >
                  {sourceLabelAr}
                </Chip>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-normal text-slate-400">
                <Chip size="sm" variant="bordered" className="border-slate-700">
                  POWER API: {powerLive ? "حي (Live)" : "احتياطي محلي (Fallback)"}
                </Chip>
                <Chip size="sm" variant="bordered" className="border-slate-700">
                  ASF SAR: {asfLive ? "حي (Live)" : "احتياطي محلي (Fallback)"}
                </Chip>
                <Chip size="sm" variant="bordered" className="border-slate-700">
                  Cache: Next.js Revalidate 86400s
                </Chip>
              </div>
            </ModalHeader>

            <ModalBody className="py-4">
              <pre
                dir="ltr"
                className="rounded-lg bg-[#05080f] border border-slate-800 p-4 text-xs leading-relaxed text-emerald-300 overflow-x-auto max-h-[440px] font-mono"
              >
                {formatted}
              </pre>
            </ModalBody>

            <ModalFooter className="justify-between">
              <Button
                size="sm"
                variant="flat"
                color="primary"
                onPress={handleCopy}
                startContent={
                  copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />
                }
              >
                {copied ? "تم النسخ" : "نسخ JSON"}
              </Button>
              <Button size="sm" color="default" variant="flat" onPress={onClose}>
                إغلاق
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

