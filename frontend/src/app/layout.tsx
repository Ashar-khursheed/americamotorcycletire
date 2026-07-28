import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { ScrollHandler } from "@/components/ScrollHandler";

export const metadata: Metadata = {
  title: "BMG CYCLES | Motorcycle Tires, Repair & Service Specialists",
  description: "Professional motorcycle repair, maintenance, and tire service. Premium street, cruiser, and racing motorcycle tires.",
  icons: {
    icon: "/bmg-logo.webp",
    shortcut: "/bmg-logo.webp",
    apple: "/bmg-logo.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/bmg-logo.webp" type="image/webp" />
        <link rel="shortcut icon" href="/bmg-logo.webp" type="image/webp" />
        <link rel="apple-touch-icon" href="/bmg-logo.webp" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Oswald:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#0A0A0A] text-white min-h-screen font-sans antialiased" suppressHydrationWarning>
        <Suspense fallback={null}>
          <ScrollHandler />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
