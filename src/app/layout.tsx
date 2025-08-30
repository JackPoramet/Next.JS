import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Auto-start essential services
import '@/lib/startup-service';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IoT Electric Energy Dashboard",
  description: "Dashboard for IoT Electric Energy Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900`}
      >
        {children}
        {/* Development test script */}
        {process.env.NODE_ENV === 'development' && (
          <script src="/test-delete-api.js" async />
        )}
      </body>
    </html>
  );
}
