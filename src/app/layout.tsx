import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { Navbar } from "@/components/layout/Navbar";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LMSUOG - Learning Management System",
  description: "Modern production-ready LMS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SettingsProvider>
          <AuthProvider>
            <Navbar />
            <main>{children}</main>
            <Toaster position="top-center" richColors />
          </AuthProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
