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
  metadataBase: new URL("https://www.achieversjuniorcollege.in"),
  title: {
    template: "%s | Achievers Junior College",
    default: "Achievers Junior College - Hyderabad's Premier Institution",
  },
  description: "Empowering the Leaders of Tomorrow with specialized programs for global success. Achievers Junior College offers top-tier education in Hyderabad.",
  keywords: ["Junior College in Hyderabad", "Achievers Junior College", "MPC", "BiPC", "MEC", "CEC", "Intermediate college", "best college in Jubilee Hills"],
  authors: [{ name: "Achievers Junior College" }],
  creator: "Achievers Junior College",
  openGraph: {
    title: "Achievers Junior College - Hyderabad's Premier Institution",
    description: "Empowering the Leaders of Tomorrow with specialized programs for global success. Achievers Junior College offers top-tier education in Hyderabad.",
    url: "https://www.achieversjuniorcollege.in",
    siteName: "Achievers Junior College",
    images: [
      {
        url: "/home-banner.webp",
        width: 1200,
        height: 630,
        alt: "Achievers Junior College Campus",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Achievers Junior College",
    description: "Empowering the Leaders of Tomorrow with specialized programs for global success.",
    images: ["/home-banner.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
