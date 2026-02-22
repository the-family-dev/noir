import type { Metadata } from "next";
import { SocketEventsHandler } from "@/components/socket-event-handlers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Noir",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="dark" lang="ru">
      <body>
        {children}
        <SocketEventsHandler />
      </body>
    </html>
  );
}
