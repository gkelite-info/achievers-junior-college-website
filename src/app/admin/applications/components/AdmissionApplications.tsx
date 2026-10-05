"use client";

import { useMemo, useState, useEffect } from "react";
import {
  ArrowLeft,
  CaretDown,
  CaretRight,
  CheckCircle,
  Envelope,
  Eye,
  FileText,
  Info,
  MagnifyingGlass,
  PaperPlaneTilt,
  TrendUp,
  Users,
  Warning,
  X,
  SpinnerGap,
  DownloadSimple,
  CheckSquare,
  Square,
} from "@phosphor-icons/react";
import ApplicationViewModal from "./ApplicationViewModal";
import {
  AchieversApplication,
  getAchieversKpiCounts,
  getAchieversRecentApplications,
  getAchieversApplicationsByYear,
  getAchieversAllApplications,
  updateApplicationAdmissionStatus,
  subscribeAchieversSubmissions,
  subscribeAchieversAnalytics,
  subscribeAchieversPayments,
  unsubscribeAchieversChannel,
  formatCourseWithCode,
} from "@/lib/helpers/admin/achieversAdmissionsHelper";
import { formatKpiNumber } from "@/lib/helpers/admin/numberFormatter";
import { downloadCSV } from "@/lib/helpers/admin/downloadCSV";
import { Pagination } from "@/app/admin/components/Pagination";
import { ApplicationsOverviewShimmer, TableShimmer } from "@/app/admin/components/Shimmers";
import toast from "react-hot-toast";

interface CollegeEducationItem {
  college_education_id: string;
  educationName: string;
  education_code: string;
  is_Active?: boolean;
}

interface CollegeBranchItem {
  college_branch_id: string;
  branchName: string;
  branch_code: string;
  college_education_id: string;
  educationName?: string;
  education_code?: string;
  is_Active?: boolean;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function StatusBadge({ value }: { value: string }) {
  const styles: Record<string, string> = {
    Success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    Failed: "bg-rose-50 text-rose-700 border-rose-200",
    Verification: "bg-blue-50 text-blue-700 border-blue-200",
    Selected: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Regret: "bg-red-50 text-red-700 border-red-200",
  };

  const style = styles[value] || "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ${style}`}>
      {value}
    </span>
  );
}

function EmailModal({
  count,
  selectedCandidates = [],
  onClose,
  onSuccess,
}: {
  count: number;
  selectedCandidates?: AchieversApplication[];
  onClose: () => void;
  onSuccess?: (newStatus: "Pending" | "Verification" | "Selected" | "Regret") => void;
}) {
  const isAlreadySelected = selectedCandidates.some(
    (c) => c.admission === "Selected"
  );
  const isAlreadyVerified = selectedCandidates.some(
    (c) => c.admission === "Verification" || c.admission === "Selected"
  );
  const isAlreadyRegret = selectedCandidates.some(
    (c) => c.admission === "Regret"
  );
  const hasFailedPayment = selectedCandidates.some(
    (c) => c.payment !== "Success"
  );

  const [template, setTemplate] = useState("Certificate Verification");
  const [confirmed, setConfirmed] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const isCurrentRestricted =
    (template === "Certificate Verification" && (isAlreadyVerified || hasFailedPayment)) ||
    (template === "Selection Congratulation" && (isAlreadySelected || hasFailedPayment)) ||
    (template === "Admission Regret" && isAlreadyRegret);

  const isConfirmed = confirmed && !isCurrentRestricted;

  const templates = [
    {
      title: "Certificate Verification",
      description: "Invite students to report for document verification.",
      icon: (
        <span className="w-5 h-5 rounded-full bg-amber-400 text-white flex items-center justify-center text-[10px] font-bold">
          i
        </span>
      ),
    },
    {
      title: "Selection Congratulation",
      description: "Congratulate students on their selection for admissions.",
      icon: (
        <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
          ✓
        </span>
      ),
    },
    {
      title: "Admission Regret",
      description: "Inform candidates that they were not placed/selected.",
      icon: (
        <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold">
          !
        </span>
      ),
    },
  ];

  const preview =
    template === "Certificate Verification"
      ? {
          subject: "Certificate Verification Schedule - AJC-XXXXXX",
          body: "Dear Student,\n\nWe have reviewed your application and would like to invite you for the physical verification of your certificates and documents as part of the admission process.\n\nPlease visit the campus between 10:00 AM and 4:00 PM on any working day.\n\nBest regards,\nAdmissions Office",
        }
      : template === "Selection Congratulation"
      ? {
          subject: "Admission Selection Offer - AJC-XXXXXX",
          body: "Dear Student,\n\nCongratulations! We are pleased to inform you that you have been selected for admission at Achievers Junior College.\n\nBest regards,\nAdmissions Office",
        }
      : {
          subject: "Admission Application Status Update - AJC-XXXXXX",
          body: "Dear Student,\n\nThank you for your interest in Achievers Junior College. We regret to inform you that we are unable to offer you admission at this time.\n\nBest regards,\nAdmissions Office",
        };

  const handleSendEmails = async () => {
    if (!isConfirmed || isSending || isCurrentRestricted) return;

    const templateTypeMap: Record<string, "verification" | "congratulate" | "regret"> = {
      "Certificate Verification": "verification",
      "Selection Congratulation": "congratulate",
      "Admission Regret": "regret",
    };
    const templateType = templateTypeMap[template] || "verification";

    let targetAdmissionStatus: "Pending" | "Verification" | "Selected" | "Regret" = "Verification";
    if (templateType === "congratulate") targetAdmissionStatus = "Selected";
    else if (templateType === "regret") targetAdmissionStatus = "Regret";

    setIsSending(true);
    const sendingToastId = toast.loading("Sending emails...");

    const recipients = selectedCandidates.map((app) => ({
      applicationId: app.applicationId || app.raw?.applicationId,
      applicationNumber: app.id,
      firstName: app.raw?.firstName || app.name.split(" ")[0] || "Applicant",
      lastName: app.raw?.lastName || app.name.split(" ").slice(1).join(" ") || "",
      emailId: app.email,
      course: app.course,
      applicationFor: app.raw?.applicationFor || "Inter",
      createdAt: app.rawDate || app.submitted,
    }));

    const validRecipients = recipients.filter((r) => r.emailId && r.emailId.includes("@"));
    if (validRecipients.length === 0) {
      toast.error("None of the selected candidates have a valid email address.", { id: sendingToastId });
      setIsSending(false);
      return;
    }

    try {
      const response = await fetch("/api/emails/send-admissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipients, templateType }),
      });

      const resData = await response.json();
      if (response.ok && resData.success) {
        toast.success(`Successfully sent emails to ${recipients.length} student(s)!`, {
          id: sendingToastId,
        });
        if (onSuccess) onSuccess(resData.admissionStatus || targetAdmissionStatus);
        onClose();
      } else {
        toast.error(resData.error || "Failed to send emails.", { id: sendingToastId });
      }
    } catch {
      toast.error("An error occurred while sending emails.", { id: sendingToastId });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      onClick={!isSending ? onClose : undefined}
    >
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
      <div
        className="relative flex max-h-[95vh] w-full max-w-[700px] flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 sm:p-7 shadow-2xl z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center shrink-0">
              <Envelope size={20} weight="fill" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 leading-tight">
                Send Admission Emails
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Select a template to send to the <strong>{count}</strong> selected student(s).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSending}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {/* Select Template Option */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
              Select Template Option
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {templates.map((tpl) => {
                const isSelected = template === tpl.title;
                const isCardVerified = tpl.title === "Certificate Verification" && isAlreadyVerified;
                const isCardSelected = tpl.title === "Selection Congratulation" && isAlreadySelected;
                const isCardRegret = tpl.title === "Admission Regret" && isAlreadyRegret;
                return (
                  <button
                    key={tpl.title}
                    type="button"
                    onClick={() => {
                      setTemplate(tpl.title);
                      setConfirmed(false);
                    }}
                    className={`flex flex-col items-start text-left p-3.5 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? "border-[#3B82F6] bg-[#EFF6FF]/60 ring-1 ring-[#3B82F6]"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <div>{tpl.icon}</div>
                      {isCardVerified && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-md">
                          Verified
                        </span>
                      )}
                      {isCardSelected && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md">
                          Selected
                        </span>
                      )}
                      {isCardRegret && (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded-md">
                          Regretted
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-gray-900 leading-snug">{tpl.title}</h4>
                    <p className="text-[11px] text-gray-500 mt-1 leading-normal">
                      {tpl.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Verification / Selection / Regret Notice Banner */}
          <div
            className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs ${
              isCurrentRestricted
                ? "bg-rose-50 border-rose-200 text-rose-900"
                : "bg-amber-50/70 border-amber-200 text-amber-900"
            }`}
          >
            <Warning
              size={16}
              className={`shrink-0 mt-0.5 ${
                isCurrentRestricted ? "text-rose-600" : "text-amber-600"
              }`}
              weight="fill"
            />
            <div className="text-[11px] leading-relaxed">
              <span className="font-bold">
                {template === "Certificate Verification"
                  ? isAlreadyVerified
                    ? "Verification Completed: "
                    : "Verification Restriction: "
                  : template === "Selection Congratulation"
                  ? isAlreadySelected
                    ? "Selection Already Completed: "
                    : "Selection Notice: "
                  : isAlreadyRegret
                  ? "Regret Already Sent: "
                  : "Regret Notice: "}
              </span>
              <span>
                {template === "Certificate Verification"
                  ? isAlreadyVerified
                    ? "Verification has already been done for the selected candidate(s). Certificate Verification confirmation is disabled."
                    : hasFailedPayment
                    ? "Selected candidate(s) do not have a successful payment status. Verification email cannot be sent."
                    : "Students must have a successful payment status and must not already be marked for verification."
                  : template === "Selection Congratulation"
                  ? isAlreadySelected
                    ? "Selected candidate(s) are already marked as Selected. Selection confirmation is disabled."
                    : hasFailedPayment
                    ? "Selected candidate(s) do not have a successful payment status."
                    : "Congratulate students on their selection for admissions."
                  : isAlreadyRegret
                  ? "Selected candidate(s) are already marked as Regret. Regret email confirmation is disabled."
                  : "Inform candidates that they were not placed/selected."}
              </span>
            </div>
          </div>

          {/* Email Template Preview Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Email Template Preview
              </span>
              <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                Achievers Layout
              </span>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-3.5 space-y-3">
              <div className="space-y-1 text-xs">
                <div>
                  <span className="font-bold text-gray-800">Subject: </span>
                  <span className="text-gray-700">{preview.subject}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-800">From: </span>
                  <span className="text-gray-600">Achievers Admissions &lt;admissions@gkeliteinfo.com&gt;</span>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-3.5 text-xs leading-relaxed text-gray-700 whitespace-pre-line shadow-sm">
                {preview.body}
              </div>
            </div>
          </div>

          {/* Confirmation Checkbox */}
          <label
            className={`flex items-center gap-3 p-3.5 rounded-xl border transition ${
              isCurrentRestricted
                ? "border-rose-200 bg-rose-50/40 cursor-not-allowed opacity-80"
                : "border-gray-200 bg-gray-50/40 hover:bg-gray-50/80 cursor-pointer"
            }`}
          >
            <input
              type="checkbox"
              checked={isConfirmed}
              onChange={(e) => {
                if (!isCurrentRestricted) {
                  setConfirmed(e.target.checked);
                }
              }}
              disabled={isSending || isCurrentRestricted}
              className="w-4 h-4 rounded border-gray-300 text-[#6366F1] focus:ring-[#6366F1] disabled:cursor-not-allowed cursor-pointer"
            />
            <span className="text-xs text-gray-600 select-none">
              {template === "Selection Congratulation" && isAlreadySelected ? (
                <span className="text-rose-600 font-semibold">
                  Selected student(s) are already marked as Selected. Confirmation is disabled.
                </span>
              ) : template === "Certificate Verification" && isAlreadyVerified ? (
                <span className="text-rose-600 font-semibold">
                  Verification has already been completed / scheduled for the selected student(s). Confirmation is disabled.
                </span>
              ) : template === "Admission Regret" && isAlreadyRegret ? (
                <span className="text-rose-600 font-semibold">
                  Selected student(s) are already marked as Regret. Confirmation is disabled.
                </span>
              ) : hasFailedPayment && (template === "Certificate Verification" || template === "Selection Congratulation") ? (
                <span className="text-rose-600 font-semibold">
                  Selected student(s) must have a successful payment status.
                </span>
              ) : (
                <>
                  I confirm that I want to send this template email to all{" "}
                  <strong className="text-[#6366F1] font-bold">
                    {count} selected candidate(s)
                  </strong>
                  . I understand this action cannot be undone.
                </>
              )}
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex justify-end items-center gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            className="px-5 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSendEmails}
            disabled={!isConfirmed || isSending || isCurrentRestricted}
            className={`px-6 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1.5 ${
              isConfirmed && !isSending && !isCurrentRestricted
                ? "bg-[#8B5CF6] hover:bg-[#7C3AED] text-white cursor-pointer"
                : "bg-[#C4B5FD] text-white/80 cursor-not-allowed"
            }`}
          >
            {isSending ? (
              <SpinnerGap size={15} className="animate-spin" />
            ) : (
              <PaperPlaneTilt size={15} weight="bold" />
            )}
            Send Emails
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdmissionApplications() {
  const currentYear = new Date().getFullYear();
  const [screen, setScreen] = useState<"overview" | "applications">("overview");
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  // KPIs
  const [visitors, setVisitors] = useState<number>(0);
  const [opens, setOpens] = useState<number>(0);
  const [submissions, setSubmissions] = useState<number>(0);
  const [kpiLoading, setKpiLoading] = useState(true);

  // Admissions Monthly Trends
  const [monthlyCounts, setMonthlyCounts] = useState<number[]>(new Array(12).fill(0));
  const [trendLoading, setTrendLoading] = useState(true);

  // Applications
  const [recentApplications, setRecentApplications] = useState<AchieversApplication[]>([]);
  const [allApplications, setAllApplications] = useState<AchieversApplication[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(true);

  // Modal & Selection
  const [selectedApplication, setSelectedApplication] = useState<AchieversApplication | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Detailed Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 250);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [courseFilter, setCourseFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [admissionFilter, setAdmissionFilter] = useState("All");
  const [percentageFrom, setPercentageFrom] = useState("");
  const [percentageTo, setPercentageTo] = useState("");
  const [applicationTab, setApplicationTab] = useState<"all" | "top">("all");

  // Dynamic Educations and Courses (Branches)
  const [educations, setEducations] = useState<CollegeEducationItem[]>([
    {
      college_education_id: "8f3505c8-696f-4d6a-adcd-df559b1720c0",
      educationName: "Intermediate Education",
      education_code: "Inter",
    },
  ]);
  const [branches, setBranches] = useState<CollegeBranchItem[]>([]);
  const [selectedEducationId, setSelectedEducationId] = useState<string>("8f3505c8-696f-4d6a-adcd-df559b1720c0");
  const [educationsLoading, setEducationsLoading] = useState<boolean>(true);

  const PERCENTAGE_STEPS = [35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];

  // Dynamic Percentage To options (e.g. if 70% selected, shows 75%, 80%, 85%, 90%, 95%, 100%)
  const percentageToOptions = useMemo(() => {
    const minVal = percentageFrom ? parseFloat(percentageFrom) : 35;
    return PERCENTAGE_STEPS.filter((p) => p > minVal);
  }, [percentageFrom]);

  const handlePercentageFromChange = (newVal: string) => {
    setPercentageFrom(newVal);
    if (newVal && percentageTo && parseFloat(percentageTo) <= parseFloat(newVal)) {
      setPercentageTo("");
    }
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setDateFrom("");
    setDateTo("");
    setCourseFilter("All");
    setPaymentFilter("All");
    setAdmissionFilter("All");
    setPercentageFrom("");
    setPercentageTo("");
    setCurrentPage(1);
  };



  // Pagination for detailed view
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Recent pagination
  const [recentPage, setRecentPage] = useState(1);
  const recentPerPage = 5;

  // Load KPI data
  useEffect(() => {
    let isMounted = true;
    async function loadKPIs() {
      try {
        const counts = await getAchieversKpiCounts();
        if (isMounted) {
          setVisitors(counts.visitors);
          setOpens(counts.opens);
          setSubmissions(counts.submissions);
          setKpiLoading(false);
        }
      } catch (err) {
        console.error("Failed loading KPIs:", err);
        if (isMounted) setKpiLoading(false);
      }
    }
    loadKPIs();
    return () => {
      isMounted = false;
    };
  }, [refreshTrigger]);

  // Load Trend data for selectedYear
  useEffect(() => {
    let isMounted = true;
    async function loadTrends() {
      setTrendLoading(true);
      try {
        const counts = await getAchieversApplicationsByYear(selectedYear);
        if (isMounted) {
          setMonthlyCounts(counts);
          setTrendLoading(false);
        }
      } catch (err) {
        console.error("Failed loading trends:", err);
        if (isMounted) setTrendLoading(false);
      }
    }
    loadTrends();
    return () => {
      isMounted = false;
    };
  }, [selectedYear, refreshTrigger]);

  // Load Recent & All Applications
  useEffect(() => {
    let isMounted = true;
    async function loadApps() {
      try {
        const [recent, all] = await Promise.all([
          getAchieversRecentApplications(10),
          getAchieversAllApplications(),
        ]);
        if (isMounted) {
          setRecentApplications(recent);
          setAllApplications(all);
          setApplicationsLoading(false);
        }
      } catch (err) {
        console.error("Failed loading applications:", err);
        if (isMounted) setApplicationsLoading(false);
      }
    }
    loadApps();
    return () => {
      isMounted = false;
    };
  }, [refreshTrigger]);

  // Load Dynamic Educations and Branches from DB
  useEffect(() => {
    let isMounted = true;
    async function loadEducationsAndBranches() {
      try {
        const res = await fetch("/api/admin/college-branches", { cache: "no-store" });
        const json = await res.json();
        if (isMounted && json.success) {
          if (Array.isArray(json.educations) && json.educations.length > 0) {
            setEducations(json.educations);
            setSelectedEducationId((prev) => {
              if (prev && json.educations.some((e: any) => e.college_education_id === prev)) {
                return prev;
              }
              return json.educations[0].college_education_id;
            });
          }
          if (Array.isArray(json.branches)) {
            setBranches(json.branches);
          }
        }
      } catch (err) {
        console.error("Failed loading educations and branches:", err);
      } finally {
        if (isMounted) setEducationsLoading(false);
      }
    }
    loadEducationsAndBranches();
    return () => {
      isMounted = false;
    };
  }, [refreshTrigger]);

  // Active branches for selected education
  const activeBranches = useMemo(() => {
    if (!selectedEducationId) return branches;
    const filtered = branches.filter((b) => b.college_education_id === selectedEducationId);
    return filtered.length > 0 ? filtered : branches;
  }, [branches, selectedEducationId]);

  // Real-time subscriptions
  useEffect(() => {
    const handleUpdate = () => {
      setRefreshTrigger((prev) => prev + 1);
    };

    const subChannel = subscribeAchieversSubmissions(handleUpdate);
    const analChannel = subscribeAchieversAnalytics(handleUpdate);
    const payChannel = subscribeAchieversPayments(handleUpdate);

    return () => {
      unsubscribeAchieversChannel(subChannel);
      unsubscribeAchieversChannel(analChannel);
      unsubscribeAchieversChannel(payChannel);
    };
  }, []);

  // Filtered applications
  const filteredApplications = useMemo(() => {
    return allApplications.filter((app) => {
      // Top Applications toggle
      const scoreNum = parseFloat(String(app.score || "").replace(/[^0-9.]/g, "")) || 0;
      if (applicationTab === "top") {
        const minTopThreshold = percentageFrom ? parseFloat(percentageFrom) : 85;
        if (!isNaN(minTopThreshold) && scoreNum < minTopThreshold) {
          return false;
        }
      }

      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase().trim();
        const matchesName = app.name.toLowerCase().includes(q);
        const matchesId = app.id.toLowerCase().includes(q);
        const matchesEmail = app.email.toLowerCase().includes(q);
        const matchesPhone = app.mobile.includes(q);
        if (!matchesName && !matchesId && !matchesEmail && !matchesPhone) return false;
      }

      if (dateFrom) {
        const appDate = new Date(app.rawDate);
        const fromDate = new Date(dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        if (!isNaN(appDate.getTime()) && appDate < fromDate) return false;
      }

      if (dateTo) {
        const appDate = new Date(app.rawDate);
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (!isNaN(appDate.getTime()) && appDate > toDate) return false;
      }

      if (courseFilter !== "All") {
        const filterLower = courseFilter.toLowerCase().trim();
        const appCourseLower = (app.course || "").toLowerCase();
        const rawCourseLower = (String(app.raw?.course || "")).toLowerCase();

        // 1. Direct match with branch code or course text
        const directMatch =
          appCourseLower.includes(filterLower) ||
          rawCourseLower.includes(filterLower);

        if (!directMatch) {
          // 2. Dynamic match using branch metadata from DB
          const matchedBranch = branches.find(
            (b) => b.branch_code?.toLowerCase() === filterLower
          );
          if (matchedBranch) {
            const bName = matchedBranch.branchName.toLowerCase();
            const bCode = matchedBranch.branch_code.toLowerCase();
            const nameMatch = appCourseLower.includes(bName) || rawCourseLower.includes(bName);

            let keywordMatch = false;
            if (bCode === "bipc") {
              keywordMatch =
                (appCourseLower.includes("biolog") && appCourseLower.includes("chem")) ||
                (rawCourseLower.includes("biolog") && rawCourseLower.includes("chem"));
            } else if (bCode === "mpc") {
              keywordMatch =
                (appCourseLower.includes("math") && appCourseLower.includes("phys")) ||
                (rawCourseLower.includes("math") && rawCourseLower.includes("phys"));
            } else if (bCode === "cec") {
              keywordMatch =
                appCourseLower.includes("commer") ||
                appCourseLower.includes("civic") ||
                rawCourseLower.includes("commer") ||
                rawCourseLower.includes("civic");
            } else if (bCode === "mec") {
              keywordMatch =
                (appCourseLower.includes("math") && appCourseLower.includes("econom")) ||
                (rawCourseLower.includes("math") && rawCourseLower.includes("econom"));
            }

            if (!nameMatch && !keywordMatch) {
              return false;
            }
          } else {
            return false;
          }
        }
      }

      if (paymentFilter !== "All") {
        if (app.payment.toLowerCase() !== paymentFilter.toLowerCase()) return false;
      }

      if (admissionFilter !== "All") {
        if (app.admission.toLowerCase() !== admissionFilter.toLowerCase()) return false;
      }

      if (percentageFrom) {
        const minPercent = parseFloat(percentageFrom);
        if (!isNaN(minPercent) && scoreNum < minPercent) return false;
      }

      if (percentageTo) {
        const maxPercent = parseFloat(percentageTo);
        if (!isNaN(maxPercent) && scoreNum > maxPercent) return false;
      }

      return true;
    });
  }, [
    allApplications,
    debouncedSearch,
    applicationTab,
    dateFrom,
    dateTo,
    courseFilter,
    branches,
    paymentFilter,
    admissionFilter,
    percentageFrom,
    percentageTo,
  ]);

  // Selection helpers
  const handleSelectAll = () => {
    if (selectedIds.length === filteredApplications.length && filteredApplications.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredApplications.map((a) => a.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedCandidatesList = useMemo(() => {
    return allApplications.filter((app) => selectedIds.includes(app.id));
  }, [allApplications, selectedIds]);

  const handleExportCSV = () => {
    const dataToExport = filteredApplications.map((app) => ({
      "Application Number": app.id,
      "Applicant Name": app.name,
      Course: app.course,
      "Submitted At": app.submitted,
      "Payment Status": app.payment,
      "Admission Status": app.admission,
      Email: app.email,
      Mobile: app.mobile,
      Score: app.score,
    }));
    downloadCSV(dataToExport, `Achievers-Applications-${new Date().toISOString().slice(0, 10)}`);
    toast.success("Applications exported to CSV successfully.");
  };

  const handleUpdateStatus = async (appNumber: string, status: any) => {
    try {
      await updateApplicationAdmissionStatus(appNumber, status);
      setAllApplications((prev) =>
        prev.map((app) => (app.id === appNumber ? { ...app, admission: status } : app))
      );
      toast.success(`Updated admission status to ${status}`);
    } catch {
      toast.error("Failed to update status.");
    }
  };

  // Paginated applications for detailed view
  const paginatedAll = filteredApplications.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Paginated recent applications for overview
  const paginatedRecent = recentApplications.slice(
    (recentPage - 1) * recentPerPage,
    recentPage * recentPerPage
  );

  const maxMonthly = Math.max(...monthlyCounts, 1);

  // DETAILED APPLICATIONS TABLE SCREEN
  if (screen === "applications") {
    return (
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <button
              onClick={() => setScreen("overview")}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#0E1528] hover:underline mb-1.5 transition cursor-pointer"
            >
              <ArrowLeft size={16} weight="bold" /> Back to overview
            </button>
            <h2 className="text-2xl font-bold text-gray-900">Applications</h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Manage and view form submissions from the website.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] hover:bg-[#1d4ed8] text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition cursor-pointer"
            >
              Export CSV
            </button>

            {/* Segmented Pill: All Applications / Top Applications */}
            <div className="inline-flex items-center bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => {
                  setApplicationTab("all");
                  setPercentageFrom("");
                  setPercentageTo("");
                  setCourseFilter("All");
                  setSelectedIds([]);
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer ${
                  applicationTab === "all"
                    ? "bg-[#7C3AED] text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                All Applications
              </button>
              <button
                onClick={() => {
                  setApplicationTab("top");
                  setPercentageFrom("90");
                  setPercentageTo("100");
                  setCourseFilter("All");
                  setSelectedIds([]);
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer ${
                  applicationTab === "top"
                    ? "bg-[#7C3AED] text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Top Applications
              </button>
            </div>
          </div>
        </div>

        {/* Course Filter Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm space-y-3">
          {/* Education Tabs */}
          <div className="border-b border-gray-100 pb-2 flex items-center gap-4">
            {educationsLoading && educations.length === 0 ? (
              <div className="h-5 w-16 rounded shimmer" />
            ) : (
              educations.map((edu) => {
                const isSelected = selectedEducationId === edu.college_education_id;
                return (
                  <button
                    key={edu.college_education_id}
                    type="button"
                    onClick={() => {
                      setSelectedEducationId(edu.college_education_id);
                      setCourseFilter("All");
                      setCurrentPage(1);
                    }}
                    className={`text-sm font-bold pb-2 px-1 transition cursor-pointer border-b-2 ${
                      isSelected
                        ? "text-[#0E1528] border-[#0E1528]"
                        : "text-gray-400 border-transparent hover:text-gray-700"
                    }`}
                  >
                    {edu.education_code || edu.educationName}
                  </button>
                );
              })
            )}
          </div>

          {/* Dynamic Courses / Branches Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setCourseFilter("All");
                setCurrentPage(1);
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                courseFilter === "All"
                  ? "bg-[#0E1528] text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              All
            </button>
            {activeBranches.length > 0
              ? activeBranches.map((branch) => {
                  const code = branch.branch_code;
                  const isSelected = courseFilter.toLowerCase() === code.toLowerCase();
                  return (
                    <button
                      key={branch.college_branch_id}
                      type="button"
                      onClick={() => {
                        setCourseFilter(code);
                        setCurrentPage(1);
                      }}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                        isSelected
                          ? "bg-[#0E1528] text-white shadow-sm"
                          : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {code}
                    </button>
                  );
                })
              : ["BiPC", "CEC", "MEC", "MPC"].map((code) => {
                  const isSelected = courseFilter.toLowerCase() === code.toLowerCase();
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => {
                        setCourseFilter(code);
                        setCurrentPage(1);
                      }}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                        isSelected
                          ? "bg-[#0E1528] text-white shadow-sm"
                          : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {code}
                    </button>
                  );
                })}
          </div>
        </div>


        {/* Filters Card */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          {/* Row 1: Search, From Date, To Date, Payment Status, Admission Status */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <MagnifyingGlass
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search name, email, phone..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0E1528]"
              />
            </div>

            {/* From Date */}
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-medium text-gray-600 whitespace-nowrap">
                From:
              </span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0E1528] cursor-pointer"
              />
            </div>

            {/* To Date */}
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-medium text-gray-600 whitespace-nowrap">
                To:
              </span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0E1528] cursor-pointer"
              />
            </div>

            {/* Payment Status */}
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-medium text-gray-600 whitespace-nowrap">
                Payment Status:
              </span>
              <div className="relative">
                <select
                  value={paymentFilter}
                  onChange={(e) => {
                    setPaymentFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0E1528] cursor-pointer"
                >
                  <option value="All">All</option>
                  <option value="Success">Success</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                </select>
                <CaretDown
                  size={13}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>

            {/* Admission Status */}
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-medium text-gray-600 whitespace-nowrap">
                Admission Status:
              </span>
              <div className="relative">
                <select
                  value={admissionFilter}
                  onChange={(e) => {
                    setAdmissionFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="appearance-none pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0E1528] cursor-pointer"
                >
                  <option value="All">All</option>
                  <option value="Pending">Pending</option>
                  <option value="Verification">Verification</option>
                  <option value="Selected">Selected</option>
                  <option value="Regret">Regret</option>
                </select>
                <CaretDown
                  size={13}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* Row 2: Percentage From, Percentage To, Send Mail, Clear Filters */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            <div className="flex flex-wrap items-center gap-4">
              {/* Percentage From */}
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-medium text-gray-600 whitespace-nowrap">
                  Percentage From:
                </span>
                <div className="relative">
                  <select
                    value={percentageFrom}
                    onChange={(e) => handlePercentageFromChange(e.target.value)}
                    className="appearance-none min-w-[90px] pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0E1528] cursor-pointer"
                  >
                    <option value="">Min</option>
                    {[35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95].map((val) => (
                      <option key={val} value={val}>
                        {val}%
                      </option>
                    ))}
                  </select>
                  <CaretDown
                    size={13}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>

              {/* Percentage To */}
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-medium text-gray-600 whitespace-nowrap">
                  Percentage To:
                </span>
                <div className="relative">
                  <select
                    value={percentageTo}
                    onChange={(e) => {
                      setPercentageTo(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="appearance-none min-w-[90px] pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0E1528] cursor-pointer"
                  >
                    <option value="">Max</option>
                    {percentageToOptions.map((val) => (
                      <option key={val} value={val}>
                        {val}%
                      </option>
                    ))}
                  </select>
                  <CaretDown
                    size={13}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>
            </div>

            {/* Right side buttons: Send Mail (only in Top Applications) & Clear Filters */}
            <div className="flex items-center gap-3 ml-auto">
              {applicationTab === "top" && (
                <button
                  type="button"
                  disabled={selectedIds.length === 0}
                  onClick={() => {
                    if (selectedIds.length > 0) {
                      setShowEmailModal(true);
                    }
                  }}
                  className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition shadow-sm ${
                    selectedIds.length > 0
                      ? "bg-[#7C3AED] hover:bg-[#6D28D9] text-white cursor-pointer"
                      : "bg-[#DDD6FE] text-white/70 cursor-not-allowed"
                  }`}
                >
                  Send Mail ({selectedIds.length})
                </button>
              )}

              {/* Clear Filters Button */}
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-4 py-2 border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-500 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {applicationsLoading ? (
            <TableShimmer />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase tracking-wider text-[11px]">
                  <tr>
                    {applicationTab === "top" && (
                      <th className="p-4 w-10 text-center">
                        <button
                          onClick={handleSelectAll}
                          className="text-gray-400 hover:text-gray-700 cursor-pointer"
                          title="Select All"
                        >
                          {selectedIds.length > 0 &&
                          selectedIds.length === filteredApplications.length ? (
                            <CheckSquare size={18} weight="fill" className="text-[#0E1528]" />
                          ) : (
                            <Square size={18} />
                          )}
                        </button>
                      </th>
                    )}
                    <th className="py-3.5 px-4 font-semibold">Application ID</th>
                    {applicationTab === "top" && (
                      <th className="py-3.5 px-3 font-semibold text-center">Rank</th>
                    )}
                    <th className="py-3.5 px-4 font-semibold">Applicant Name</th>
                    <th className="py-3.5 px-4 font-semibold">Course</th>
                    <th className="py-3.5 px-4 font-semibold">Contact</th>
                    <th className="py-3.5 px-4 font-semibold">Percentage</th>
                    <th className="py-3.5 px-4 font-semibold">Date</th>
                    <th className="py-3.5 px-4 font-semibold">Payment Status</th>
                    <th className="py-3.5 px-4 font-semibold">Admission Status</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedAll.map((app, index) => {
                    const isSelected = selectedIds.includes(app.id);

                    return (
                      <tr
                        key={app.id}
                        className={`hover:bg-gray-50/70 transition-colors ${
                          isSelected ? "bg-slate-100/60" : ""
                        }`}
                      >
                        {applicationTab === "top" && (
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleToggleSelect(app.id)}
                              className="text-gray-400 hover:text-gray-700 cursor-pointer"
                            >
                              {isSelected ? (
                                <CheckSquare size={18} weight="fill" className="text-[#0E1528]" />
                              ) : (
                                <Square size={18} />
                              )}
                            </button>
                          </td>
                        )}

                        <td className="py-3.5 px-4 text-xs font-mono text-gray-500 whitespace-nowrap">
                          {app.id}
                        </td>

                        {applicationTab === "top" && (
                          <td className="py-3.5 px-3 text-xs font-bold text-gray-700 text-center">
                            #{index + 1 + (currentPage - 1) * itemsPerPage}
                          </td>
                        )}


                        <td className="py-3.5 px-4 font-bold text-gray-900 whitespace-nowrap">
                          {app.name}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-medium text-gray-800">{app.course}</span>
                        </td>

                        <td className="py-3.5 px-4 text-xs">
                          <div className="font-medium text-gray-800">{app.email || "N/A"}</div>
                          <div className="text-[11px] text-gray-500 font-mono mt-0.5">{app.mobile || "N/A"}</div>
                        </td>

                        <td className="py-3.5 px-4 font-semibold text-[#0E1528]">
                          {app.score}
                        </td>

                        <td className="py-3.5 px-4 text-gray-600 text-xs whitespace-nowrap">
                          {app.submitted}
                        </td>

                        <td className="py-3.5 px-4">
                          <StatusBadge value={app.payment} />
                        </td>

                        <td className="py-3.5 px-4">
                          <select
                            value={app.admission}
                            onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                            className={`text-xs font-semibold px-2 py-1.5 rounded-lg border focus:outline-none focus:ring-1 cursor-pointer transition-colors ${
                              app.admission === "Selected"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 focus:ring-emerald-500 hover:bg-emerald-100"
                                : app.admission === "Pending"
                                ? "bg-amber-50 text-amber-700 border-amber-200 focus:ring-amber-500 hover:bg-amber-100"
                                : app.admission === "Verification"
                                ? "bg-blue-50 text-blue-700 border-blue-200 focus:ring-blue-500 hover:bg-blue-100"
                                : app.admission === "Regret"
                                ? "bg-rose-50 text-rose-700 border-rose-200 focus:ring-rose-500 hover:bg-rose-100"
                                : "bg-gray-50 text-gray-700 border-gray-200 focus:ring-gray-500 hover:bg-gray-100"
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Verification">Verification</option>
                            <option value="Selected">Selected</option>
                            <option value="Regret">Regret</option>
                          </select>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedApplication(app)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-slate-100 hover:text-[#0E1528] text-gray-700 transition cursor-pointer font-medium text-xs"
                          >
                            <Eye size={15} /> Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredApplications.length === 0 && (
                    <tr>
                      <td
                        colSpan={applicationTab === "top" ? 11 : 9}
                        className="py-12 text-center text-gray-500"
                      >
                        No applications matched your search or filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalItems={filteredApplications.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            itemsPerPageOptions={[5, 10, 20, 50]}
            onItemsPerPageChange={(val) => {
              setItemsPerPage(val);
              setCurrentPage(1);
            }}
            alwaysShow
          />
        </div>

        {/* Modals */}
        <ApplicationViewModal
          application={selectedApplication}
          isOpen={selectedApplication !== null}
          onClose={() => setSelectedApplication(null)}
        />

        {showEmailModal && (
          <EmailModal
            count={selectedIds.length}
            selectedCandidates={selectedCandidatesList}
            onClose={() => setShowEmailModal(false)}
            onSuccess={async (newStatus) => {
              if (newStatus) {
                // 1. Immediately update UI state so table reflects status without waiting
                setAllApplications((prev) =>
                  prev.map((app) =>
                    selectedIds.includes(app.id) ? { ...app, admission: newStatus } : app
                  )
                );
                // 2. Direct client-side update to Supabase for each application ID
                try {
                  await Promise.all(
                    selectedIds.map((id) => updateApplicationAdmissionStatus(id, newStatus))
                  );
                } catch (e) {
                  console.error("Direct update error:", e);
                }
              }
              setSelectedIds([]);
              setRefreshTrigger((prev) => prev + 1);
            }}
          />
        )}
      </div>
    );
  }

  // OVERVIEW SCREEN (DEFAULT)
  if (kpiLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Admissions Overview</h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Track website activity and recent admission submissions.
          </p>
        </div>
        <ApplicationsOverviewShimmer />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Admissions Overview</h2>
        <p className="text-xs sm:text-sm text-gray-500">
          Track website activity and recent admission submissions.
        </p>
      </div>

      {/* 3 KPI Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {[
          {
            title: "Website Visitors",
            value: formatKpiNumber(visitors),
            icon: <Users size={28} weight="duotone" />,
            style: "border-blue-100 bg-blue-50/50 text-blue-600",
          },
          {
            title: "Admissions Opened",
            value: formatKpiNumber(opens),
            icon: <FileText size={28} weight="duotone" />,
            style: "border-orange-100 bg-orange-50/50 text-orange-600",
          },
          {
            title: "Forms Submitted",
            value: formatKpiNumber(submissions),
            icon: <CheckCircle size={28} weight="duotone" />,
            style: "border-slate-200 bg-slate-50/80 text-[#0E1528]",
          },
        ].map((card) => (
          <div
            key={card.title}
            className={`flex items-center gap-4 rounded-2xl border p-5 ${card.style} shadow-sm transition hover:shadow-md`}
          >
            <div className="rounded-2xl bg-white p-3 shadow-sm">{card.icon}</div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{card.title}</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-0.5">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 2-Column Trends & Recent Applications */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_1fr]">
        {/* Trend Bar Chart */}
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">Admissions Trend</h3>
              <p className="text-xs text-gray-500">
                Monthly form submissions overview for {selectedYear}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="cursor-pointer rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none hover:bg-gray-100"
              >
                {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                <TrendUp size={18} weight="bold" />
              </div>
            </div>
          </div>

          <div className="flex h-64 items-end gap-2 rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-4 pt-8">
            {monthlyCounts.map((value, index) => (
              <div
                key={months[index]}
                className="flex h-full flex-1 flex-col justify-end gap-2 text-center"
              >
                <div className="group relative flex flex-1 items-end">
                  <span className="absolute left-1/2 -top-7 z-10 -translate-x-1/2 rounded bg-gray-900 px-2 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none">
                    {value} applications
                  </span>
                  <div
                    className="w-full rounded-t bg-[#0E1528] hover:bg-[#1a2542] transition-all duration-300"
                    style={{ height: `${Math.max((value / maxMonthly) * 100, 4)}%` }}
                  />
                </div>
                <span className="text-[10px] font-medium text-gray-500 sm:text-xs">
                  {months[index]}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Applications List */}
        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <div>
                <h3 className="text-base font-bold text-gray-900">Recent Applications</h3>
                <p className="text-xs text-gray-500">Latest website submissions</p>
              </div>
              <button
                onClick={() => setScreen("applications")}
                className="flex items-center gap-1 text-xs font-bold text-[#0E1528] hover:text-[#1a2542] transition cursor-pointer"
              >
                View All <CaretRight size={14} weight="bold" />
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {paginatedRecent.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedApplication(item)}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 p-4 text-left transition hover:bg-gray-50/80"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="rounded-xl bg-slate-100 p-2.5 text-[#0E1528] shrink-0">
                      <FileText size={18} weight="duotone" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">{item.name}</p>
                      <p className="truncate text-xs text-gray-500">
                        {item.course} &bull; {item.id}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <StatusBadge value={item.payment} />
                    <p className="mt-1 text-[11px] text-gray-400">{item.submitted}</p>
                  </div>
                </button>
              ))}

              {recentApplications.length === 0 && (
                <div className="p-8 text-center text-xs sm:text-sm text-gray-500">
                  No recent submissions found.
                </div>
              )}
            </div>
          </div>

          {!applicationsLoading && recentApplications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-100">
              <Pagination
                currentPage={recentPage}
                totalItems={recentApplications.length}
                itemsPerPage={recentPerPage}
                onPageChange={setRecentPage}
                roundedBottom="rounded-b-2xl"
                alwaysShow
              />
            </div>
          )}
        </section>
      </div>

      {/* Modal */}
      <ApplicationViewModal
        application={selectedApplication}
        isOpen={selectedApplication !== null}
        onClose={() => setSelectedApplication(null)}
      />
    </div>
  );
}
