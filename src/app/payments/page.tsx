import type { Metadata } from "next";
import PaymentsDirectory from "./PaymentsDirectory";

export const metadata: Metadata = {
  title: "Payments | Achievers Junior College",
  description: "Review your application and proceed to the registration payment preview.",
};

export default function PaymentsPage() {
  return <PaymentsDirectory />;
}
