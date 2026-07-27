import type { Metadata } from "next";
import { SocketEventsHandler } from "@/components/socket-event-handlers";
import { Toaster } from "@/components/ui/sonner";
import { GameHeader } from "@/components/game-header";
import { AppFooter } from "@/components/app-footer";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Noir",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={cn("dark h-full", "font-sans", geist.variable)} lang="ru">
      <body className="flex flex-col h-full p-4">
        <div className="flex flex-col gap-8 h-full">
          <GameHeader />
          <div className="flex min-h-0 flex-1 items-center justify-center w-full">
            {children}
          </div>
          <SocketEventsHandler />
          <Toaster />
        </div>
        <AppFooter />
      </body>
    </html>
  );
}
