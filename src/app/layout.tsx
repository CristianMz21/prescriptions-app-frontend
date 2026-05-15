import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { getAuth } from "@/lib/auth/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RX-OS | Prescription Management",
  description: "Precision Control System for Medical Prescriptions",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialUser = await getAuth();
  // SSR theme: avoid flash by setting the right html class up front. SYSTEM
  // resolves on the client via prefers-color-scheme; default to dark for SSR.
  const themeIsDark = initialUser?.themePreference === "LIGHT" ? false : true;
  const htmlClass = themeIsDark ? "dark" : "";

  return (
    <html
      lang="en"
      className={htmlClass}
      data-theme={initialUser?.themePreference ?? "SYSTEM"}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-full flex flex-col antialiased bg-background text-on-surface`}
      >
        <Providers initialUser={initialUser}>{children}</Providers>
      </body>
    </html>
  );
}
