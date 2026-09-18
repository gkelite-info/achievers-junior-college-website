import type { Metadata } from "next";
import ApplicationForm from "./ApplicationForm";
import { applicants } from "../payments/sampleApplicants";

export const metadata: Metadata = {
  title: "Apply Now | Achievers Junior College",
  description: "Complete your intermediate application for Achievers Junior College.",
};

export default async function ApplyPage({ searchParams }: { searchParams: Promise<{ application?: string }> }) {
  const { application } = await searchParams;
  const details = applicants.find((person) => person.applicationId === application);
  return <ApplicationForm key={application || "new"} initialDetails={details} />;
}
