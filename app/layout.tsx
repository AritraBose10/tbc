import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import LoadingScreen from "@/components/LoadingScreen";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Biryani Canteen",
  description: "Royal Indian Cuisine - Mobile First Ordering App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${plusJakartaSans.variable} font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased`}
      >
        <LoadingScreen />
        <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden mughal-pattern">
          {children}
        </div>
      </body>
    </html>
  );
}
