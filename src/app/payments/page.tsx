import type { Metadata } from "next";
import { Suspense } from "react";
import PaymentsDirectory from "./PaymentsDirectory";

export const metadata: Metadata = {
  title: "Payments | Achievers Junior College",
  description: "Review your application and proceed to the registration payment preview.",
};

export default function PaymentsPage() {
  return (
    <Suspense fallback={<div className="min-h-[400px] flex items-center justify-center text-slate-500 font-medium">Loading...</div>}>
      <PaymentsDirectory />
    </Suspense>
  );
}

