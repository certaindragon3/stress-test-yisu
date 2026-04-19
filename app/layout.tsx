import type { Metadata } from "next";
import { EB_Garamond } from "next/font/google";

import "./globals.css";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-eb-garamond",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The AI Discourse Stress-Tester",
  description:
    "A thinking instrument that presses a claim about AI and education through three dimensions drawn from Yisu Zhou's Software 3.0 University keynote.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={ebGaramond.variable}>
      <body className="bg-white font-sans text-neutral-900 antialiased">
        {children}
      </body>
    </html>
  );
}
