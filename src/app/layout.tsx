import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

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
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
