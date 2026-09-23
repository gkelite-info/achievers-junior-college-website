"use client";

import { applicationToDetails, useApplication } from "@/lib/helpers/applicationsAPI";
import ApplicationForm from "./ApplicationForm";
import { Suspense } from "react";

export default function ApplicationEditor({ applicationId }: { applicationId?: string }) {
  const application = useApplication(applicationId);
  if (!applicationId) return <Suspense fallback={<p className="p-8">Loading form...</p>}><ApplicationForm /></Suspense>;
  if (application.isPending) return <p className="p-8" role="status">Loading your application...</p>;
  if (application.isError) return <div className="p-8" role="alert"><p>{application.error.message}</p><a href="/payments" className="underline">Verify application details</a></div>;
  if (!application.data) return <p className="p-8" role="alert">Application not found.</p>;
  return <Suspense fallback={<p className="p-8">Loading form...</p>}><ApplicationForm initialDetails={applicationToDetails(application.data)} /></Suspense>;
}
