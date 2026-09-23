import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import QueryProvider from "@/components/providers/QueryProvider";
import ApplyModal from "@/components/layout/ApplyModal";
import { Suspense } from "react";
import { Toaster } from "react-hot-toast";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Achievers Junior College",
  description: "Hyderabad's Premier Institution. Empowering the Leaders of Tomorrow with specialized programs for global success.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${sora.variable} h-full antialiased scroll-smooth overflow-x-hidden`}
    >
      <body className="min-h-full flex flex-col pt-[68px]">
        <QueryProvider>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <Suspense fallback={null}>
            <ApplyModal />
          </Suspense>
          <Toaster position="top-right" />
        </QueryProvider>
      </body>
    </html>
  );
}
