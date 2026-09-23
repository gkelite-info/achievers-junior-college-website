import type { Metadata } from "next";
import ApplicationEditor from "./ApplicationEditor";

export const metadata: Metadata = {
  title: "Apply Now | Achievers Junior College",
  description: "Complete your intermediate application for Achievers Junior College.",
};

export default async function ApplyPage({ searchParams }: { searchParams: Promise<{ application?: string }> }) {
  const { application } = await searchParams;
  return <ApplicationEditor key={application || "new"} applicationId={application} />;
}
