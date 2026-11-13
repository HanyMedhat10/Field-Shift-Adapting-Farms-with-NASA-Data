import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { Providers } from "./providers";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ElMazra3a EL sa3ida — Field Shift | NASA Space Apps 2026",
  description:
    "منصة قرار زراعي موحدة تربط بيانات وكالة ناسا متعددة المقاييس لمقارنة الدورات الزراعية وكشف المفاضلات ونطاقات عدم اليقين P10/P50/P90.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`dark ${cairo.variable}`} suppressHydrationWarning>
      <body className="min-h-screen antialiased transition-colors duration-200">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
